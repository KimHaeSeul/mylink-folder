"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { type Link as LinkType } from "@/data/links";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

function EditableLinkCard({
  link,
  onUpdate,
  onDelete,
}: {
  link: LinkType;
  onUpdate: (id: string, title: string, url: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(link.title);
  const [editUrl, setEditUrl] = useState(link.url);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setError("");
    const trimmedTitle = editTitle.trim();
    const trimmedUrl = editUrl.trim();

    if (!trimmedTitle || !trimmedUrl) {
      setError("Please enter title and URL");
      return;
    }

    let finalUrl = trimmedUrl;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    if (!urlPattern.test(finalUrl)) {
      setError("Please enter a valid URL");
      return;
    }

    try {
      await onUpdate(link.id, trimmedTitle, finalUrl);
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update");
    }
  };

  let hostname = "example.com";
  try {
    hostname = new URL(link.url).hostname;
  } catch (e) {}

  if (isEditing) {
    return (
      <Card className="overflow-hidden p-4 border-primary/50 shadow-md transition-all">
        <div className="flex flex-col gap-3">
          {error && <div className="text-destructive text-xs font-semibold">{error}</div>}
          <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" />
          <Input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} placeholder="URL" />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>삭제</Button>
            <Button variant="secondary" size="sm" onClick={() => { setIsEditing(false); setEditTitle(link.title); setEditUrl(link.url); setError(""); }}>취소</Button>
            <Button size="sm" onClick={handleSave}>저장</Button>
          </div>
        </div>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>정말 삭제하시겠습니까?</DialogTitle>
              <DialogDescription className="text-base text-foreground mt-2">
                {link.title}
                <span className="text-destructive font-semibold mt-4 block text-sm">이 작업은 되돌릴 수 없습니다</span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>취소</Button>
              <Button variant="destructive" onClick={() => { onDelete(link.id); setIsDeleteDialogOpen(false); }}>삭제하기</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    );
  }

  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:scale-102 hover:shadow-md active:scale-98 cursor-pointer group"
      onClick={() => setIsEditing(true)}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/50 p-2 overflow-hidden">
          <img
            src={
              link.url.includes("blog.naver.com")
                ? "https://blog.naver.com/favicon.ico"
                : `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`
            }
            alt={link.title}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="flex flex-1 items-center justify-between">
          <span className="font-medium text-foreground">{link.title}</span>
          <span className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 text-lg">✎</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      // 로그인 시 유저 프로필 정보를 Firestore에 저장/업데이트
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        await setDoc(userRef, {
          displayName: currentUser.email?.split("@")[0] || currentUser.displayName || "",
          photoURL: currentUser.photoURL || "",
          email: currentUser.email || "",
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setLinks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const q = query(
      collection(db, `users/${user.uid}/links`),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedLinks: LinkType[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || "",
            url: data.url || "",
            clickCount: data.clickCount || 0,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || undefined,
          };
        });
        setLinks(fetchedLinks);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching links: ", err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: unknown) {
      // 사용자가 팝업을 닫은 경우는 정상적인 동작이므로 무시
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: string }).code === "auth/popup-closed-by-user"
      ) {
        return;
      }
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setError("");
      setNewTitle("");
      setNewUrl("");
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");

    const trimmedTitle = newTitle.trim();
    const trimmedUrl = newUrl.trim();

    if (!trimmedTitle) {
      setError("Please enter a valid title");
      return;
    }

    if (!trimmedUrl) {
      setError("Please enter a valid URL");
      return;
    }

    let finalUrl = trimmedUrl;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    if (!urlPattern.test(finalUrl)) {
      setError("Please enter a valid URL");
      return;
    }

    try {
      await addDoc(collection(db, `users/${user.uid}/links`), {
        title: trimmedTitle,
        url: finalUrl,
        clickCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setNewTitle("");
      setNewUrl("");
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Error adding link to Firestore: ", err);
      setError("Failed to save link. Please try again.");
    }
  };

  const handleUpdateLink = async (id: string, title: string, url: string) => {
    if (!user) return;
    const docRef = doc(db, `users/${user.uid}/links`, id);
    await updateDoc(docRef, { title, url, updatedAt: serverTimestamp() });
  };

  const handleDeleteLink = async (id: string) => {
    if (!user) return;
    const docRef = doc(db, `users/${user.uid}/links`, id);
    await deleteDoc(docRef);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 sm:px-8 md:px-16 lg:px-32">
        <Skeleton className="h-20 w-20 rounded-full mb-4" />
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center bg-background px-4 sm:px-8 md:px-16 lg:px-32 xl:px-48 pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-24">
      {/* Top Right Profile Dropdown - fixed */}
      <div className="fixed top-4 right-4 sm:top-5 sm:right-6 md:top-6 md:right-8 lg:top-6 lg:right-12 xl:right-16 z-20">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="flex items-center gap-2 rounded-full p-1 hover:bg-muted transition-colors focus:outline-none">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="h-8 w-8 rounded-full ring-2 ring-border"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold ring-2 ring-border">
                      {user.email?.split("@")[0]?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex items-center gap-3 pb-2">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="h-8 w-8 rounded-full flex-shrink-0" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">
                      {user.email?.split("@")[0]?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="font-medium truncate">{user.email?.split("@")[0] || "User"}</span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={
                <a href={`/${user.uid}`} target="_blank" rel="noopener noreferrer" className="cursor-pointer" />
              }>
                내 페이지 미리보기
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/${user.uid}`);
                  toast("링크가 복사되었습니다!");
                }}
                className="cursor-pointer"
              >
                내 페이지 링크 복사
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {user ? (
        <>
          {/* Profile Header */}
          <div className="mb-10 flex flex-col items-center gap-4">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="h-20 w-20 rounded-full ring-4 ring-background shadow-xl" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground ring-4 ring-background shadow-xl">
                {user.email?.split("@")[0]?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight">@{user.email?.split("@")[0] || "User"}</h1>
              <p className="text-sm text-muted-foreground">Minimalist Link Management</p>
            </div>
          </div>

          {/* Link List */}
          <div className="flex w-full max-w-md flex-col gap-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden shadow-sm">
                  <CardContent className="flex items-center gap-4 p-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex flex-1 items-center justify-between">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-4 rounded-full" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              links.map((link) => (
                <EditableLinkCard
                  key={link.id}
                  link={link}
                  onUpdate={handleUpdateLink}
                  onDelete={handleDeleteLink}
                />
              ))
            )}


            {/* Add Link Dialog */}
            <div className="w-full mt-2">
              <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
                <DialogTrigger render={
                  <Button variant="outline" className="w-full border-dashed border-2 py-6 rounded-xl hover:scale-102 hover:shadow-md active:scale-98 transition-all">
                    <HugeiconsIcon icon={PlusSignIcon} size={16} className="mr-2" />
                    Add Link
                  </Button>
                } />
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>새 링크 추가</DialogTitle>
                    <DialogDescription>
                      새로운 링크의 제목과 URL을 입력해주세요.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddLink}>
                    {error && (
                      <div className="mt-2 text-destructive text-xs font-semibold bg-destructive/10 border border-destructive/20 p-3 rounded-lg text-center">
                        {error}
                      </div>
                    )}
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">제목</Label>
                        <Input
                          id="title"
                          placeholder="예: 나의 멋진 블로그"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="url">URL</Label>
                        <Input
                          id="url"
                          type="text"
                          placeholder="예: google.com"
                          value={newUrl}
                          onChange={(e) => setNewUrl(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)}>
                        취소
                      </Button>
                      <Button type="submit">저장</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </>
      ) : (
        /* Logged Out State */
        <div className="flex w-full max-w-md flex-col items-center justify-center py-20 text-center">
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="text-4xl font-bold">M</span>
          </div>
          <h2 className="mb-4 text-2xl font-bold tracking-tight">나만의 링크 프로필을 만들어보세요</h2>
          <p className="mb-8 text-muted-foreground">
            로그인하시면 나만의 링크 페이지를 만들고 관리할 수 있습니다.<br/>
            불필요한 기능 없이 텍스트와 파비콘만으로 깔끔하게 완성해보세요.
          </p>
          <Button size="lg" onClick={handleLogin} className="w-full max-w-sm rounded-full h-14 text-base font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all">
            구글 계정으로 시작하기
          </Button>
        </div>
      )}

    </div>
  );
}

