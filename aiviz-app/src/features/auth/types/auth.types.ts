export type Role = "student" | "parent" | "teacher" | "admin";

export type User = {
  id: number;
  email: string;
  phone: string | null;
  role: Role;
  first_name: string;
  last_name: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  date_joined: string;
};

export type Profile = {
  grade: number | null;
  board: string | null;
  subjects: string[];
  lang: "en" | "hi" | "mr";
  learning_style: string | null;
  goals: string[];
  updated_at: string;
};

export type Tokens = {
  access: string;
  refresh: string;
};

export type AuthResponse = {
  user: User;
  tokens: Tokens;
  created?: boolean;
};

export type MeResponse = {
  user: User;
  profile: Profile | null;
};

export type SignupPayload = {
  email: string;
  password: string;
  phone?: string;
  role?: Role;
  first_name?: string;
  last_name?: string;
};

export type LoginPayload = {
  identifier: string;
  password: string;
};

export type GooglePayload = {
  id_token: string;
};
