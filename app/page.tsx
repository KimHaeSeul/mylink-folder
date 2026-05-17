"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { dummyLinks, type Link as LinkType } from "@/data/links";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Page() {
  const [links, setLinks] = useState<LinkType[]>(dummyLinks);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;

    // Validate URL scheme if missing
    let finalUrl = newUrl;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    const newLink: LinkType = {
      id: Date.now().toString(),
      title: newTitle,
      url: finalUrl,
      updatedAt: new Date().toISOString(),
    };

    setLinks([...links, newLink]);
    setNewTitle("");
    setNewUrl("");
    setIsDialogOpen(false);
  };

  return (
    <div className="flex min-h-svh flex-col items-center bg-background px-6 pt-12 pb-24">
      {/* Profile Header */}
      <div className="mb-10 flex flex-col items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground ring-4 ring-background shadow-xl">
          M
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">@My-Link</h1>
          <p className="text-sm text-muted-foreground">Minimalist Link Management</p>
        </div>
      </div>

      {/* Link List */}
      <div className="flex w-full max-w-md flex-col gap-4">
        {links.map((link) => {
          let hostname = "example.com";
          try {
            hostname = new URL(link.url).hostname;
          } catch (e) {
            // Ignore invalid URLs
          }

          return (
            <Link
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <Card className="overflow-hidden transition-all duration-300 hover:scale-102 hover:shadow-md active:scale-98">
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
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={16}
                      className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        {links.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No links added yet. Click "Add Link" to get started.
          </div>
        )}

        {/* Add Link Dialog at the bottom */}
        <div className="w-full mt-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={
              <Button variant="outline" className="w-full border-dashed border-2 py-6 rounded-xl hover:scale-102 hover:shadow-md active:scale-98 transition-all">
                <HugeiconsIcon icon={PlusSignIcon} size={16} className="mr-2" />
                Add Link
              </Button>
            } />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Link</DialogTitle>
                <DialogDescription>
                  Enter the title and URL for your new link.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddLink}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g. My Awesome Blog"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="e.g. https://example.com"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Link</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Sticky Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-10 flex justify-center p-6 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none">
        <Link
          href="/signup"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "w-full max-w-md rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 text-sm h-12 pointer-events-auto"
          )}
        >
          Create your My-Link
        </Link>
      </footer>
    </div>
  );
}
