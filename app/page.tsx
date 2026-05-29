"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, setDoc, getDoc, getDocs, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { type Link as LinkType } from "@/data/links";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { SimpleEyeIcon } from "@/components/ui/simple-eye-icon";
import { cn } from "@/lib/utils";
import LandingPage from "@/components/landing-page";
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

function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const hostname = url.hostname;
    if (!hostname) return false;
    if (hostname !== "localhost" && !hostname.includes(".")) return false;
    return true;
  } catch {
    return false;
  }
}

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

    if (!isValidUrl(finalUrl)) {
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
          <div className="flex flex-col items-start gap-1">
            <span className="font-medium text-foreground">{link.title}</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <SimpleEyeIcon className="h-3.5 w-3.5 text-muted-foreground/80" />
              <span>{link.clickCount || 0}</span>
            </div>
          </div>
          <span className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 text-lg">✎</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Page() {
  interface ProfileType {
    username: string;
    name: string;
    bio: string;
  }

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameChecked, setIsUsernameChecked] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      // 로그인 시 유저 프로필 정보를 Firestore에 저장/업데이트
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        let profile = userDoc.exists() ? userDoc.data()?.profile : null;

        // profile 필드가 없거나 username이 비어있는 경우 초기화
        if (!profile || !profile.username) {
          const emailPrefix = currentUser.email?.split("@")[0] || "user";
          // 영문 소문자, 숫자, 언더바(_), 마침표(.)만 허용
          let baseUsername = emailPrefix.toLowerCase().replace(/[^a-z0-9_.]/g, "");
          if (baseUsername.length < 3) {
            baseUsername = "user." + baseUsername;
          }
          if (baseUsername.length > 20) {
            baseUsername = baseUsername.slice(0, 20);
          }

          let finalUsername = baseUsername;
          let isUnique = false;
          let attempts = 0;

          while (!isUnique && attempts < 10) {
            const q = query(
              collection(db, "users"),
              where("profile.username", "==", finalUsername)
            );
            const querySnapshot = await getDocs(q);
            
            // 본인을 제외한 다른 유저가 이 username을 쓰고 있는지 체크
            const duplicate = querySnapshot.docs.find(doc => doc.id !== currentUser.uid);

            if (!duplicate) {
              isUnique = true;
            } else {
              attempts++;
              // 중복일 시 4자리 랜덤 숫자 덧붙임
              const randomSuffix = Math.floor(1000 + Math.random() * 9000);
              finalUsername = `${baseUsername.slice(0, 15)}_${randomSuffix}`;
            }
          }

          profile = {
            username: finalUsername,
            name: currentUser.displayName || emailPrefix,
            bio: "Minimalist Link Management",
          };
        }

        await setDoc(userRef, {
          displayName: currentUser.displayName || currentUser.email?.split("@")[0] || "",
          photoURL: currentUser.photoURL || "",
          email: currentUser.email || "",
          profile: profile,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
    });
    return () => unsubscribe();
  }, []);

  // 유저 프로필 실시간 구독
  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.profile) {
            setProfile({
              username: data.profile.username || "",
              name: data.profile.name || "",
              bio: data.profile.bio || "",
            });
          }
        }
        setProfileLoading(false);
      },
      (err) => {
        console.error("Error fetching user profile:", err);
        setProfileLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 프로필 수정 다이얼로그 열릴 때 폼 필드 로드
  useEffect(() => {
    if (isProfileEditOpen && profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditUsername(profile.username);
      setEditName(profile.name);
      setEditBio(profile.bio);
      setUsernameError("");
      setIsUsernameChecked(true);
      setProfileError("");
    }
  }, [isProfileEditOpen, profile]);

  // 한국어 키보드 자판 → QWERTY 영문 변환 맵
  const KO_TO_EN_MAP: Record<string, string> = {
    "ㅂ": "q", "ㅈ": "w", "ㄷ": "e", "ㄱ": "r", "ㅅ": "t",
    "ㅛ": "y", "ㅕ": "u", "ㅑ": "i", "ㅐ": "o", "ㅔ": "p",
    "ㅁ": "a", "ㄴ": "s", "ㅇ": "d", "ㄹ": "f", "ㅎ": "g",
    "ㅗ": "h", "ㅓ": "j", "ㅏ": "k", "ㅣ": "l",
    "ㅋ": "z", "ㅌ": "x", "ㅊ": "c", "ㅍ": "v",
    "ㅠ": "b", "ㅜ": "n", "ㅡ": "m",
    // 쌍자음 / 이중모음 (shift)
    "ㅃ": "q", "ㅉ": "w", "ㄸ": "e", "ㄲ": "r", "ㅆ": "t",
    "ㅒ": "o", "ㅖ": "p",
  };

  const convertKoreanToEnglish = (str: string): string =>
    str.split("").map((ch) => KO_TO_EN_MAP[ch] ?? ch).join("");

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const converted = convertKoreanToEnglish(e.target.value);
    const value = converted.toLowerCase().replace(/[^a-z0-9_.]/g, "");
    setEditUsername(value);
    setIsUsernameChecked(false);
    setUsernameError("");
  };

  const handleUsernameCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    // IME 조합 완료 후 한글을 영문으로 변환
    const converted = convertKoreanToEnglish((e.target as HTMLInputElement).value);
    const value = converted.toLowerCase().replace(/[^a-z0-9_.]/g, "");
    setEditUsername(value);
    setIsUsernameChecked(false);
    setUsernameError("");
  };

  const handleCheckUsername = async () => {
    if (!user) return;
    setUsernameError("");
    setIsCheckingUsername(true);

    const trimmed = editUsername.trim();
    if (trimmed.length < 3) {
      setUsernameError("Username은 3자 이상이어야 합니다.");
      setIsCheckingUsername(false);
      return;
    }
    if (trimmed.length > 20) {
      setUsernameError("Username은 20자 이하이어야 합니다.");
      setIsCheckingUsername(false);
      return;
    }

    if (profile && trimmed === profile.username) {
      setIsUsernameChecked(true);
      setIsCheckingUsername(false);
      return;
    }

    try {
      const q = query(
        collection(db, "users"),
        where("profile.username", "==", trimmed)
      );
      const querySnapshot = await getDocs(q);
      const duplicate = querySnapshot.docs.find((doc) => doc.id !== user.uid);

      if (duplicate) {
        setUsernameError("이미 사용 중인 Username입니다.");
        setIsUsernameChecked(false);
      } else {
        setIsUsernameChecked(true);
        setUsernameError("");
        toast("사용 가능한 Username입니다!");
      }
    } catch (err) {
      console.error(err);
      setUsernameError("중복 확인 중 오류가 발생했습니다.");
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileError("");

    const finalUsername = editUsername.trim();
    const finalName = editName.trim();
    const finalBio = editBio.trim();

    if (!finalUsername || !finalName) {
      setProfileError("Username과 이름을 모두 입력해주세요.");
      return;
    }

    if (finalUsername.length < 3 || finalUsername.length > 20) {
      setProfileError("Username은 3자 이상 20자 이하로 입력해주세요.");
      return;
    }

    if (!isUsernameChecked) {
      setProfileError("Username 중복 확인을 먼저 해주세요.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          profile: {
            username: finalUsername,
            name: finalName,
            bio: finalBio,
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setIsProfileEditOpen(false);
      toast("프로필이 성공적으로 업데이트되었습니다!");
    } catch (err) {
      console.error(err);
      setProfileError("프로필 저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

    if (!isValidUrl(finalUrl)) {
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

  if (user) {
    return (
      <div className="flex min-h-svh flex-col items-center bg-background px-4 sm:px-8 md:px-16 lg:px-32 xl:px-48 pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-24">
        {/* Top Right Profile Dropdown - fixed */}
        <div className="fixed top-4 right-4 sm:top-5 sm:right-6 md:top-6 md:right-8 lg:top-6 lg:right-12 xl:right-16 z-20">
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
                      {profile?.name?.[0]?.toUpperCase() || user.email?.split("@")[0]?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="font-medium truncate">{profile?.name || user.email?.split("@")[0] || "User"}</span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={
                <Link href="/stats" className="cursor-pointer w-full" />
              }>
                통계 대시보드
              </DropdownMenuItem>
              <DropdownMenuItem render={
                <a href={`/${profile?.username || user.uid}`} target="_blank" rel="noopener noreferrer" className="cursor-pointer" />
              }>
                내 페이지 미리보기
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/${profile?.username || user.uid}`);
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
      </div>

      {/* Profile Header */}
      <div className="mb-10 flex flex-col items-center gap-4">
        {user.photoURL ? (
          <img src={user.photoURL} alt="Profile" className="h-20 w-20 rounded-full ring-4 ring-background shadow-xl" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground ring-4 ring-background shadow-xl">
            {profile?.name?.[0]?.toUpperCase() || user.email?.split("@")[0]?.[0]?.toUpperCase() || "U"}
          </div>
        )}
        <div className="text-center flex flex-col items-center">
          <h1 className="text-2xl font-bold tracking-tight">
            {profileLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              profile?.name || user.displayName || user.email?.split("@")[0] || "User"
            )}
          </h1>
          <span className="text-sm text-muted-foreground mt-1 block">
            {profileLoading ? (
              <Skeleton className="h-4 w-24 mt-1" />
            ) : (
              `@${profile?.username || user.email?.split("@")[0]}`
            )}
          </span>
          <span className="text-sm text-muted-foreground mt-0.5 block">
            {profileLoading ? (
              <Skeleton className="h-4 w-40 mt-1" />
            ) : (
              profile?.bio || "Minimalist Link Management"
            )}
          </span>
          
          {/* 프로필 수정 버튼 */}
          <div className="mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full gap-1.5 text-xs h-8 px-3 transition-all hover:scale-105 active:scale-95 shadow-sm"
              onClick={() => setIsProfileEditOpen(true)}
              disabled={profileLoading}
            >
              <span>프로필 수정</span>
              <span className="text-xs">✎</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Edit Dialog */}
      <Dialog open={isProfileEditOpen} onOpenChange={(open) => {
        setIsProfileEditOpen(open);
        if (!open) {
          setProfileError("");
          setUsernameError("");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>프로필 수정</DialogTitle>
            <DialogDescription>
              공개 페이지에 노출될 프로필 정보를 수정합니다.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {profileError && (
              <div className="text-destructive text-xs font-semibold bg-destructive/10 border border-destructive/20 p-3 rounded-lg text-center">
                {profileError}
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="edit-username">Username (고유 주소용)</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                  <Input
                    id="edit-username"
                    className="pl-7"
                    placeholder="username"
                    value={editUsername}
                    onChange={handleUsernameChange}
                    onCompositionEnd={handleUsernameCompositionEnd}
                    inputMode="url"
                    lang="en"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                  />
                </div>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={handleCheckUsername}
                  disabled={isCheckingUsername || isUsernameChecked || !editUsername}
                >
                  {isCheckingUsername ? "확인 중..." : isUsernameChecked ? "확인 완료" : "중복 확인"}
                </Button>
              </div>
              {usernameError && (
                <p className="text-destructive text-xs mt-0.5">{usernameError}</p>
              )}
              {isUsernameChecked && !usernameError && editUsername && (
                <p className="text-green-600 text-xs mt-0.5">✓ 사용 가능한 Username입니다.</p>
              )}
              <p className="text-[11px] text-muted-foreground">
                영문 소문자, 숫자, 언더바(_), 마침표(.)만 가능하며 고유한 주소로 사용됩니다.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-name">이름</Label>
              <Input
                id="edit-name"
                placeholder="이름 또는 닉네임"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={30}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-bio">소개글</Label>
              <Input
                id="edit-bio"
                placeholder="나를 설명하는 한 줄 소개글"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                maxLength={80}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="secondary" onClick={() => setIsProfileEditOpen(false)}>
                취소
              </Button>
              <Button type="submit" disabled={isSavingProfile || (editUsername !== profile?.username && !isUsernameChecked)}>
                {isSavingProfile ? "저장 중..." : "저장"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
    </div>
  );
}

return <LandingPage onLogin={handleLogin} />;
}

