"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "convex/react";
import { FormEvent, useState } from "react";
import { api } from "../../convex/_generated/api";
import { MessageList } from "@/Chat/MessageList";
import { Message } from "@/Chat/Message";
import { Id } from "../../convex/_generated/dataModel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Chat({ viewer }: { viewer: Id<"users"> }) {
  const [newMessageText, setNewMessageText] = useState("");
  const messages = useQuery(api.messages.list);
  const sendMessage = useMutation(api.messages.send);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const me = useQuery(api.auth.getMe);
  const updateRole = useMutation(api.auth.updateRole);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNewMessageText("");
    sendMessage({ body: newMessageText }).catch((error) => {
      console.error("Failed to send message:", error);
      setError("You have the right to party, but not to post.");
    });
  };

  const handleDeleteMessage = (messageId: Id<"messages">) => {
    deleteMessage({ messageId }).catch((error) => {
      console.error("Failed to delete message:", error);
      setError("You have the right to party, but not to delete messages.");
    });
  };

  const handleRoleChange = (newRole: "read" | "write" | "admin") => {
    updateRole({ role: newRole }).catch((error) => {
      console.error("Failed to update role:", error);
      setError("Failed to update role");
    });
  };

  /**
   * Just used for the UI to show the delete button to admins.
   * The server-side check is done with checkPermission.
   */
  const isAdmin = me?.role === "admin";

  return (
    <>
      <MessageList messages={messages}>
        {messages?.map((message) => (
          <Message
            key={message._id}
            messageId={message._id}
            author={message.userId}
            authorName={message.author}
            viewer={viewer}
            showDelete={isAdmin}
            onDelete={handleDeleteMessage}
          >
            {message.body}
          </Message>
        ))}
      </MessageList>
      <div className="border-t">
        <form onSubmit={handleSubmit} className="container flex gap-2 py-4">
          <Input
            value={newMessageText}
            onChange={(event) => setNewMessageText(event.target.value)}
            placeholder="Write a message…"
          />
          <Button type="submit" disabled={newMessageText === ""}>
            Send
          </Button>
        </form>
        <p className="text-red-500 pl-8 h-8">{error || " "}</p>

        <div className="container flex items-center gap-2 pb-4">
          <span className="text-sm text-gray-500">Test different roles:</span>
          <Select
            value={me?.role ?? "read"}
            onValueChange={(value: "read" | "write" | "admin") =>
              handleRoleChange(value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="write">Write</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}
