import Dexie, { Table } from "dexie";

export interface DEX_Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  threadId: string;
  created_at: Date;
  thought: string;
}

export interface DEX_Thread {
  id: string;
  title: string;
  created_at: Date;
  updated_at: Date;
}

class ChatDB extends Dexie {
  messages!: Table<DEX_Message, string>;
  threads!: Table<DEX_Thread, string>;

  constructor() {
    super("chatdb");

    this.version(1).stores({
      messages: "id, role, content, threadId, created_at",
      threads: "id, title, created_at, updated_at",
    });

    this.threads.hook("creating", (key, obj) => {
      obj.created_at = new Date();
      obj.updated_at = new Date();
    });

    this.messages.hook("creating", (key, obj) => {
      obj.created_at = new Date();
    });
  }

  async createThread(title: string) {
    const id = crypto.randomUUID();

    return this.threads.add({
      id,
      title,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  async getAllThreads() {
    return this.threads.orderBy("updated_at").toArray();
  }

  async createMessage(
    message: Pick<DEX_Message, "role" | "content" | "threadId" | "thought">
  ) {
    return this.messages.add({
      ...message,
      id: crypto.randomUUID(),
      created_at: new Date(),
    });
  }

  async getMessagesForThread(threadId: string) {
    return this.messages
      .where("threadId")
      .equals(threadId)
      .sortBy("created_at");
  }
}

export const db = new ChatDB();
