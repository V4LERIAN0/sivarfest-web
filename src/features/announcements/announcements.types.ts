export interface Announcement {
  id: number;
  title: string;
  message: string;
  audience: "PUBLIC" | "ATHLETES" | "JUDGES";
  published: boolean;
  updatedAt: string;
}
