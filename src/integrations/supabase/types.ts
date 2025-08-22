export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Quiz answer structure types
export interface QuizAnswer {
  answer: string;
  isCorrect: boolean | null;
}

export interface QuizAttemptAnswers {
  [questionId: string]: QuizAnswer;
}

// Legacy support for backward compatibility
export type LegacyQuizAnswers = Record<string, string>;

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      ai_advisor_insights: {
        Row: {
          data_snapshot: Json
          generated_at: string
          id: string
          insights: Json
          user_id: string
          user_type: string
        }
        Insert: {
          data_snapshot: Json
          generated_at?: string
          id?: string
          insights: Json
          user_id: string
          user_type: string
        }
        Update: {
          data_snapshot?: Json
          generated_at?: string
          id?: string
          insights?: Json
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      ai_assistant_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chapter_enrollments: {
        Row: {
          chapter_id: string
          enrolled_at: string
          id: string
          student_id: string
        }
        Insert: {
          chapter_id: string
          enrolled_at?: string
          id?: string
          student_id: string
        }
        Update: {
          chapter_id?: string
          enrolled_at?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_enrollments_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chapter_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_objects: {
        Row: {
          chapter_id: string
          created_at: string
          description: string | null
          id: string
          object_data: Json | null
          object_id: string | null
          object_type: string
          shared_by: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          chapter_id: string
          created_at?: string
          description?: string | null
          id?: string
          object_data?: Json | null
          object_id?: string | null
          object_type: string
          shared_by: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          chapter_id?: string
          created_at?: string
          description?: string | null
          id?: string
          object_data?: Json | null
          object_id?: string | null
          object_type?: string
          shared_by?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chapter_objects_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chapter_objects_object_id_course_fkey"
            columns: ["object_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chapter_objects_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          instructor_id: string | null
          order_index: number
          price: number
          status: string | null
          title: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          instructor_id?: string | null
          order_index?: number
          price?: number
          status?: string | null
          title: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          instructor_id?: string | null
          order_index?: number
          price?: number
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_codes: {
        Row: {
          code: string
          course_id: string
          created_at: string
          created_by: string
          current_uses: number
          discount_amount: number | null
          discount_percentage: number | null
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          updated_at: string
        }
        Insert: {
          code: string
          course_id: string
          created_at?: string
          created_by: string
          current_uses?: number
          discount_amount?: number | null
          discount_percentage?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
        }
        Update: {
          code?: string
          course_id?: string
          created_at?: string
          created_by?: string
          current_uses?: number
          discount_amount?: number | null
          discount_percentage?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_codes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          chapter_id: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          enrollment_code: string | null
          id: string
          instructor_id: string
          price: number
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          chapter_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          enrollment_code?: string | null
          id?: string
          instructor_id: string
          price?: number
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          chapter_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          enrollment_code?: string | null
          id?: string
          instructor_id?: string
          price?: number
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_replies: {
        Row: {
          content: string
          created_at: string
          discussion_id: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          discussion_id: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          discussion_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_replies_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
        ]
      }
      discussions: {
        Row: {
          content: string
          course_id: string
          created_at: string
          id: string
          student_id: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          course_id: string
          created_at?: string
          id?: string
          student_id: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          course_id?: string
          created_at?: string
          id?: string
          student_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          course_id: string
          enrolled_at: string
          id: string
          student_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string
          id?: string
          student_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      google_oauth_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          refresh_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id?: string
          refresh_token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          refresh_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_oauth_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          student_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          student_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_messages: {
        Row: {
          content: string
          created_at: string
          group_id: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          group_id: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_objects: {
        Row: {
          created_at: string
          description: string | null
          group_id: string
          id: string
          object_data: Json | null
          object_id: string | null
          object_type: string
          shared_by: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          group_id: string
          id?: string
          object_data?: Json | null
          object_id?: string | null
          object_type: string
          shared_by: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          group_id?: string
          id?: string
          object_data?: Json | null
          object_id?: string | null
          object_type?: string
          shared_by?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_objects_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          group_code: string
          id: string
          is_code_visible: boolean
          is_members_visible: boolean
          is_public: boolean | null
          max_members: number | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          group_code: string
          id?: string
          is_code_visible?: boolean
          is_members_visible?: boolean
          is_public?: boolean | null
          max_members?: number | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          group_code?: string
          id?: string
          is_code_visible?: boolean
          is_members_visible?: boolean
          is_public?: boolean | null
          max_members?: number | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lesson_content: {
        Row: {
          created_at: string
          id: string
          is_transcribed: boolean | null
          lesson_id: string
          summary: string | null
          transcription: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_transcribed?: boolean | null
          lesson_id: string
          summary?: string | null
          transcription?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_transcribed?: boolean | null
          lesson_id?: string
          summary?: string | null
          transcription?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_content_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: true
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          id: string
          lesson_id: string
          student_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          lesson_id: string
          student_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          lesson_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_views: {
        Row: {
          completed: boolean | null
          id: string
          lesson_id: string
          student_id: string
          view_duration: number | null
          viewed_at: string
        }
        Insert: {
          completed?: boolean | null
          id?: string
          lesson_id: string
          student_id: string
          view_duration?: number | null
          viewed_at?: string
        }
        Update: {
          completed?: boolean | null
          id?: string
          lesson_id?: string
          student_id?: string
          view_duration?: number | null
          viewed_at?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          chapter_id: string | null
          course_id: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          order_index: number
          title: string
          updated_at: string
          video_url: string | null
          view_limit: number | null
        }
        Insert: {
          chapter_id?: string | null
          course_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          order_index?: number
          title: string
          updated_at?: string
          video_url?: string | null
          view_limit?: number | null
        }
        Update: {
          chapter_id?: string | null
          course_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          order_index?: number
          title?: string
          updated_at?: string
          video_url?: string | null
          view_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      live_lectures: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          duration_minutes: number
          google_event_id: string | null
          id: string
          meet_link: string | null
          start_time: string
          status: string
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          google_event_id?: string | null
          id?: string
          meet_link?: string | null
          start_time: string
          status?: string
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          google_event_id?: string | null
          id?: string
          meet_link?: string | null
          start_time?: string
          status?: string
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_lectures_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_lectures_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matchmaking_queue: {
        Row: {
          category: string | null
          created_at: string
          id: string
          room_id: string | null
          status: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          room_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          room_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      minute_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "minute_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      multiplayer_quiz_questions: {
        Row: {
          category: string
          correct_answer: string
          created_at: string
          difficulty: string
          id: string
          instructor_id: string | null
          options: Json
          question: string
          time_limit: number
        }
        Insert: {
          category?: string
          correct_answer: string
          created_at?: string
          difficulty?: string
          id?: string
          instructor_id?: string | null
          options: Json
          question: string
          time_limit?: number
        }
        Update: {
          category?: string
          correct_answer?: string
          created_at?: string
          difficulty?: string
          id?: string
          instructor_id?: string | null
          options?: Json
          question?: string
          time_limit?: number
        }
        Relationships: [
          {
            foreignKeyName: "multiplayer_quiz_questions_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          daily_free_minutes_used: number
          email: string
          full_name: string | null
          id: string
          last_free_minutes_reset: string | null
          minutes: number
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          wallet: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          daily_free_minutes_used?: number
          email: string
          full_name?: string | null
          id: string
          last_free_minutes_reset?: string | null
          minutes?: number
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          wallet?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          daily_free_minutes_used?: number
          email?: string
          full_name?: string | null
          id?: string
          last_free_minutes_reset?: string | null
          minutes?: number
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          wallet?: number
        }
        Relationships: []
      }
      question_answers: {
        Row: {
          content: string
          created_at: string
          id: string
          is_accepted: boolean | null
          is_anonymous: boolean
          likes_count: number | null
          parent_id: string | null
          question_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_accepted?: boolean | null
          is_anonymous?: boolean
          likes_count?: number | null
          parent_id?: string | null
          question_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_accepted?: boolean | null
          is_anonymous?: boolean
          likes_count?: number | null
          parent_id?: string | null
          question_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_answers_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "question_answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          allow_student_answers: boolean
          content: string
          created_at: string
          id: string
          instructor_id: string | null
          is_anonymous: boolean
          status: string | null
          student_id: string
          title: string
          updated_at: string
        }
        Insert: {
          allow_student_answers?: boolean
          content: string
          created_at?: string
          id?: string
          instructor_id?: string | null
          is_anonymous?: boolean
          status?: string | null
          student_id: string
          title: string
          updated_at?: string
        }
        Update: {
          allow_student_answers?: boolean
          content?: string
          created_at?: string
          id?: string
          instructor_id?: string | null
          is_anonymous?: boolean
          status?: string | null
          student_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          }
        ]
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          id: string
          max_score: number | null
          quiz_id: string
          score: number | null
          started_at: string
          student_id: string
          submitted_at: string | null
        }
        Insert: {
          answers?: Json | null
          id?: string
          max_score?: number | null
          quiz_id: string
          score?: number | null
          started_at?: string
          student_id: string
          submitted_at?: string | null
        }
        Update: {
          answers?: Json | null
          id?: string
          max_score?: number | null
          quiz_id?: string
          score?: number | null
          started_at?: string
          student_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string | null
          id: string
          options: Json | null
          order_index: number
          points: number | null
          question_image: string | null
          question_text: string
          question_type: string
          quiz_id: string
        }
        Insert: {
          correct_answer?: string | null
          id?: string
          options?: Json | null
          order_index?: number
          points?: number | null
          question_image?: string | null
          question_text: string
          question_type: string
          quiz_id: string
        }
        Update: {
          correct_answer?: string | null
          id?: string
          options?: Json | null
          order_index?: number
          points?: number | null
          question_image?: string | null
          question_text?: string
          question_type?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_room_answers: {
        Row: {
          answer_time_seconds: number
          answered_at: string
          id: string
          is_correct: boolean
          points_earned: number
          question_id: string
          room_id: string
          selected_answer: string
          user_id: string
        }
        Insert: {
          answer_time_seconds: number
          answered_at?: string
          id?: string
          is_correct: boolean
          points_earned?: number
          question_id: string
          room_id: string
          selected_answer: string
          user_id: string
        }
        Update: {
          answer_time_seconds?: number
          answered_at?: string
          id?: string
          is_correct?: boolean
          points_earned?: number
          question_id?: string
          room_id?: string
          selected_answer?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_room_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "multiplayer_quiz_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_room_answers_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "quiz_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_room_players: {
        Row: {
          id: string
          joined_at: string
          room_id: string
          score: number
          streak: number
          user_id: string
          username: string
          xp_earned: number
        }
        Insert: {
          id?: string
          joined_at?: string
          room_id: string
          score?: number
          streak?: number
          user_id: string
          username: string
          xp_earned?: number
        }
        Update: {
          id?: string
          joined_at?: string
          room_id?: string
          score?: number
          streak?: number
          user_id?: string
          username?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_room_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "quiz_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_rooms: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          current_players: number
          current_question_index: number
          id: string
          is_public: boolean | null
          max_players: number
          question_start_time: string | null
          room_code: string | null
          shuffled_questions: string[] | null
          status: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          current_players?: number
          current_question_index?: number
          id?: string
          is_public?: boolean | null
          max_players?: number
          question_start_time?: string | null
          room_code?: string | null
          shuffled_questions?: string[] | null
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          current_players?: number
          current_question_index?: number
          id?: string
          is_public?: boolean | null
          max_players?: number
          question_start_time?: string | null
          room_code?: string | null
          shuffled_questions?: string[] | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          allow_review: boolean | null
          chapter_id: string | null
          course_id: string
          created_at: string
          description: string | null
          id: string
          max_attempts: number | null
          order_index: number
          question_navigation: boolean | null
          show_correct_answers: boolean | null
          show_results: boolean | null
          shuffle_questions: boolean | null
          time_limit: number | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          allow_review?: boolean | null
          chapter_id?: string | null
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          max_attempts?: number | null
          order_index?: number
          question_navigation?: boolean | null
          show_correct_answers?: boolean | null
          show_results?: boolean | null
          shuffle_questions?: boolean | null
          time_limit?: number | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          allow_review?: boolean | null
          chapter_id?: string | null
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          max_attempts?: number | null
          order_index?: number
          question_navigation?: boolean | null
          show_correct_answers?: boolean | null
          show_results?: boolean | null
          shuffle_questions?: boolean | null
          time_limit?: number | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      student_call_history: {
        Row: {
          call_date: string
          call_duration_minutes: number
          call_ended_at: string | null
          call_started_at: string
          created_at: string
          id: string
          lesson_id: string | null
          student_id: string
        }
        Insert: {
          call_date?: string
          call_duration_minutes?: number
          call_ended_at?: string | null
          call_started_at?: string
          created_at?: string
          id?: string
          lesson_id?: string | null
          student_id: string
        }
        Update: {
          call_date?: string
          call_duration_minutes?: number
          call_ended_at?: string | null
          call_started_at?: string
          created_at?: string
          id?: string
          lesson_id?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_call_history_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_call_history_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_schedule_tasks: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          order_index: number
          priority: string
          status: string
          tags: string[] | null
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          order_index?: number
          priority?: string
          status?: string
          tags?: string[] | null
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          order_index?: number
          priority?: string
          status?: string
          tags?: string[] | null
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_schedule_tasks_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          bio: string | null
          colors: Json | null
          cover_image_url: string | null
          created_at: string
          display_name: string
          experience_years: number | null
          id: string
          is_active: boolean
          profile_image_url: string | null
          slug: string
          social_links: Json | null
          specialization: string | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          bio?: string | null
          colors?: Json | null
          cover_image_url?: string | null
          created_at?: string
          display_name: string
          experience_years?: number | null
          id?: string
          is_active?: boolean
          profile_image_url?: string | null
          slug: string
          social_links?: Json | null
          specialization?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          bio?: string | null
          colors?: Json | null
          cover_image_url?: string | null
          created_at?: string
          display_name?: string
          experience_years?: number | null
          id?: string
          is_active?: boolean
          profile_image_url?: string | null
          slug?: string
          social_links?: Json | null
          specialization?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teachers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_codes: {
        Row: {
          amount: number
          code: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean
          updated_at: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          amount: number
          code: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          amount?: number
          code?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          course_id: string | null
          created_at: string
          description: string | null
          id: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_message_status: {
        Row: {
          created_at: string
          id: string
          message_id: string
          recipient_id: string
          status: string
          timestamp: string
          updated_at: string
          webhook_data: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          recipient_id: string
          status: string
          timestamp: string
          updated_at?: string
          webhook_data?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          recipient_id?: string
          status?: string
          timestamp?: string
          updated_at?: string
          webhook_data?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_wallet_funds: {
        Args: { p_amount: number; p_description?: string }
        Returns: Json
      }
      enroll_chapter_with_payment: {
        Args: { p_chapter_id: string }
        Returns: Json
      }
      enroll_with_payment: {
        Args: { p_course_id: string; p_discount_code?: string }
        Returns: Json
      }
      generate_enrollment_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_group_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_wallet_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_group_creator: {
        Args: { group_id: string; user_id: string }
        Returns: boolean
      }
      is_group_member: {
        Args: { group_id: string; user_id: string }
        Returns: boolean
      }
      join_group_by_code: {
        Args: { p_group_code: string }
        Returns: Json
      }
      purchase_minutes: {
        Args: { p_cost_per_minute?: number; p_minutes: number }
        Returns: Json
      }
      redeem_wallet_code: {
        Args: { p_code: string }
        Returns: Json
      }
      reorder_lessons: {
        Args: { p_course_id: string; p_lesson_orders: Json }
        Returns: undefined
      }
    }
    Enums: {
      user_role: "admin" | "teacher" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "teacher", "student"],
    },
  },
} as const
