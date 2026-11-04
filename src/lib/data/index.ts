import "server-only";
import { isDemoMode } from "@/lib/supabase/config";
import {
  demoAdminRepository,
  demoDonorRepository,
  demoNgoRepository,
} from "@/lib/demo/repository";
import {
  supabaseAdminRepository,
  supabaseDonorRepository,
  supabaseNgoRepository,
} from "@/lib/data/supabase-repository";
import type {
  AdminRepository,
  DonorRepository,
  NgoRepository,
} from "@/lib/data/types";

export function getDonorRepository(): DonorRepository {
  return isDemoMode ? demoDonorRepository : supabaseDonorRepository;
}

export function getNgoRepository(): NgoRepository {
  return isDemoMode ? demoNgoRepository : supabaseNgoRepository;
}

export function getAdminRepository(): AdminRepository {
  return isDemoMode ? demoAdminRepository : supabaseAdminRepository;
}

export { isDemoMode };
