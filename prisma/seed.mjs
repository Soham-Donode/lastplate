#!/usr/bin/env node
/**
 * Seeds LastPlate through Prisma.
 *
 * Usage:
 *   npm run db:seed
 *
 * The script creates confirmed Supabase Auth users directly in the auth schema
 * (bcrypt via pgcrypto), then writes profiles, donations, requests, and
 * collection records through Prisma. It is safe to re-run: accounts are matched
 * by email and rows are upserted by deterministic ids.
 */

import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PASSWORD = "LastPlate#2026";
const HOUR = 60 * 60 * 1000;
const INSTANCE_ID = "00000000-0000-0000-0000-000000000000";

function iso(hoursFromNow, now = new Date()) {
  return new Date(now.getTime() + hoursFromNow * HOUR);
}

const accounts = [
  {
    key: "donor",
    email: "ananya@saffronkitchen.in",
    role: "donor",
    fullName: "Ananya Rao",
    organizationName: "Saffron Kitchen",
    organizationType: "Restaurant",
    phone: "+91 98450 22178",
    city: "Bengaluru",
    address: "14, 5th Cross, Indiranagar, Bengaluru",
    latitude: 12.9719,
    longitude: 77.6412,
    verificationStatus: "verified",
  },
  {
    key: "donor2",
    email: "vikram@greenleafhostel.in",
    role: "donor",
    fullName: "Vikram Shetty",
    organizationName: "Green Leaf Hostel",
    organizationType: "College hostel",
    phone: "+91 98450 33421",
    city: "Bengaluru",
    address: "9, 80 Feet Road, Koramangala, Bengaluru",
    latitude: 12.9352,
    longitude: 77.6245,
    verificationStatus: "verified",
  },
  {
    key: "ngo",
    email: "meera@annapurnatrust.org",
    role: "ngo",
    fullName: "Meera Krishnan",
    organizationName: "Annapurna Trust",
    organizationType: "Community kitchen",
    phone: "+91 98450 55672",
    city: "Bengaluru",
    address: "32, 1st Main, Indiranagar, Bengaluru",
    latitude: 12.9784,
    longitude: 77.6408,
    verificationStatus: "verified",
    registrationNumber: "NGO/KA/2019/0142",
    verificationNotes:
      "Registered with the Karnataka Societies Registrar. Reference available on request.",
  },
  {
    key: "ngo2",
    email: "joseph@feedinghands.org",
    role: "ngo",
    fullName: "Joseph Mathew",
    organizationName: "Feeding Hands Foundation",
    organizationType: "Food rescue NGO",
    phone: "+91 98450 66781",
    city: "Bengaluru",
    address: "7, Old Madras Road, Bengaluru",
    latitude: 12.9634,
    longitude: 77.6368,
    verificationStatus: "verified",
    registrationNumber: "NGO/KA/2016/0087",
  },
  {
    key: "ngo3",
    email: "sana@rotibank.in",
    role: "ngo",
    fullName: "Sana Iqbal",
    organizationName: "Roti Bank Bengaluru",
    organizationType: "Food rescue NGO",
    phone: "+91 98450 77890",
    city: "Bengaluru",
    address: "18, Mosque Road, Frazer Town, Bengaluru",
    latitude: 12.996,
    longitude: 77.621,
    verificationStatus: "pending",
    registrationNumber: "NGO/KA/2023/0311",
    verificationNotes:
      "New partner. Registration certificate shared with the LastPlate team.",
  },
  {
    key: "ngo4",
    email: "ravi@sevameals.org",
    role: "ngo",
    fullName: "Ravi Deshpande",
    organizationName: "Seva Meal Collective",
    organizationType: "Community kitchen",
    phone: "+91 98450 88901",
    city: "Bengaluru",
    address: "5, 8th Block, Koramangala, Bengaluru",
    latitude: 12.9345,
    longitude: 77.6101,
    verificationStatus: "verified",
    registrationNumber: "NGO/KA/2020/0204",
  },
  {
    key: "admin",
    email: "priya@lastplate.org",
    role: "admin",
    fullName: "Priya Nair",
    organizationName: "LastPlate Operations",
    organizationType: "Platform administration",
    phone: "+91 80 4000 1200",
    city: "Bengaluru",
    address: "LastPlate, Bengaluru",
    latitude: 12.9716,
    longitude: 77.5946,
    verificationStatus: "verified",
  },
];

function metadataFor(account) {
  return {
    role: account.role,
    full_name: account.fullName,
    organization_name: account.organizationName,
    organization_type: account.organizationType,
    phone: account.phone,
    city: account.city,
    address: account.address,
    registration_number: account.registrationNumber ?? "",
    verification_notes: account.verificationNotes ?? "",
  };
}

async function ensureAuthUser(account) {
  const metadata = metadataFor(account);
  const existing = await prisma.$queryRaw`
    select id::text as id from auth.users where lower(email) = lower(${account.email}) limit 1
  `;

  if (existing.length > 0) {
    const id = existing[0].id;
    await prisma.$executeRaw`
      update auth.users
      set
        encrypted_password = extensions.crypt(${PASSWORD}, extensions.gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        raw_user_meta_data = ${JSON.stringify(metadata)}::jsonb,
        updated_at = now()
      where id = ${id}::uuid
    `;
    await prisma.$executeRaw`
      insert into auth.identities (
        provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
      )
      values (
        ${id}, ${id}::uuid,
        ${JSON.stringify({ sub: id, email: account.email, email_verified: true })}::jsonb,
        'email', now(), now(), now()
      )
      on conflict (provider_id, provider)
      do update set identity_data = excluded.identity_data, updated_at = now()
    `;
    return id;
  }

  const id = randomUUID();
  await prisma.$executeRaw`
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    )
    values (
      ${INSTANCE_ID}::uuid, ${id}::uuid, 'authenticated', 'authenticated',
      ${account.email},
      extensions.crypt(${PASSWORD}, extensions.gen_salt('bf')),
      now(),
      ${JSON.stringify({ provider: "email", providers: ["email"] })}::jsonb,
      ${JSON.stringify(metadata)}::jsonb,
      now(), now(), '', '', '', ''
    )
  `;
  await prisma.$executeRaw`
    insert into auth.identities (
      provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    )
    values (
      ${id}, ${id}::uuid,
      ${JSON.stringify({ sub: id, email: account.email, email_verified: true })}::jsonb,
      'email', now(), now(), now()
    )
  `;

  return id;
}

const donationLocations = {
  "b1000000-0000-4000-8000-000000000001": [12.9723, 77.6418],
  "b1000000-0000-4000-8000-000000000002": [12.9715, 77.6405],
  "b1000000-0000-4000-8000-000000000003": [12.9356, 77.624],
  "b1000000-0000-4000-8000-000000000004": [12.972, 77.6425],
  "b1000000-0000-4000-8000-000000000005": [12.9717, 77.641],
  "b1000000-0000-4000-8000-000000000006": [12.935, 77.6238],
  "b1000000-0000-4000-8000-000000000007": [12.9358, 77.625],
  "b1000000-0000-4000-8000-000000000008": [12.9351, 77.6242],
};

function donationData(ids) {
  return [
    {
      id: "b1000000-0000-4000-8000-000000000001",
      donor_id: ids.donor,
      title: "Vegetable pulao with raita",
      description:
        "Freshly prepared vegetable pulao cooked in small batches for the lunch service, with chilled cucumber raita on the side.",
      category: "cooked_meals",
      quantity: 12,
      quantity_unit: "kg",
      food_type: "vegetarian",
      allergens: "Milk (raita), mustard seeds",
      prepared_at: iso(-2),
      safe_until: iso(5),
      pickup_deadline: iso(3.5),
      pickup_address:
        "Saffron Kitchen, 14, 5th Cross, Indiranagar, Bengaluru",
      city: "Bengaluru",
      additional_instructions:
        "Please bring insulated containers. Ask for the kitchen manager at the service entrance.",
      status: "available",
      assigned_ngo_id: null,
    },
    {
      id: "b1000000-0000-4000-8000-000000000002",
      donor_id: ids.donor,
      title: "Assorted breads and buns",
      description:
        "Bakery surplus from this morning — whole wheat loaves, pav buns, and a few croissants, all baked today.",
      category: "bread_bakery",
      quantity: 6,
      quantity_unit: "kg",
      food_type: "vegetarian",
      allergens: "Wheat, gluten, milk",
      prepared_at: iso(-6),
      safe_until: iso(20),
      pickup_deadline: iso(7),
      pickup_address:
        "Saffron Kitchen, 14, 5th Cross, Indiranagar, Bengaluru",
      city: "Bengaluru",
      additional_instructions: null,
      status: "available",
      assigned_ngo_id: null,
    },
    {
      id: "b1000000-0000-4000-8000-000000000003",
      donor_id: ids.donor2,
      title: "Fresh fruit crates",
      description:
        "Bananas, apples, and seasonal oranges from the breakfast counter. Washed, sorted, and packed in crates.",
      category: "fruits",
      quantity: 9,
      quantity_unit: "kg",
      food_type: "vegetarian",
      allergens: null,
      prepared_at: iso(-4),
      safe_until: iso(30),
      pickup_deadline: iso(9),
      pickup_address:
        "Green Leaf Hostel, 9, 80 Feet Road, Koramangala, Bengaluru",
      city: "Bengaluru",
      additional_instructions: null,
      status: "available",
      assigned_ngo_id: null,
    },
    {
      id: "b1000000-0000-4000-8000-000000000004",
      donor_id: ids.donor,
      title: "Rajma chawal",
      description:
        "Slow-cooked kidney beans in a tomato and onion gravy with steamed basmati rice. Packed in food-grade trays.",
      category: "cooked_meals",
      quantity: 18,
      quantity_unit: "kg",
      food_type: "vegetarian",
      allergens: "None known",
      prepared_at: iso(-1),
      safe_until: iso(4),
      pickup_deadline: iso(2),
      pickup_address:
        "Saffron Kitchen, 14, 5th Cross, Indiranagar, Bengaluru",
      city: "Bengaluru",
      additional_instructions: "Call the kitchen line on arrival.",
      status: "assigned",
      assigned_ngo_id: ids.ngo,
    },
    {
      id: "b1000000-0000-4000-8000-000000000005",
      donor_id: ids.donor,
      title: "Paneer butter masala with rotis",
      description:
        "Paneer curry with fresh tandoori rotis, packed and refrigerated after the dinner service.",
      category: "cooked_meals",
      quantity: 15,
      quantity_unit: "kg",
      food_type: "vegetarian",
      allergens: "Milk, wheat",
      prepared_at: iso(-26),
      safe_until: iso(-20),
      pickup_deadline: iso(-22),
      pickup_address:
        "Saffron Kitchen, 14, 5th Cross, Indiranagar, Bengaluru",
      city: "Bengaluru",
      additional_instructions: null,
      status: "collected",
      assigned_ngo_id: ids.ngo2,
    },
    {
      id: "b1000000-0000-4000-8000-000000000006",
      donor_id: ids.donor2,
      title: "Chicken biryani",
      description:
        "Dum-cooked chicken biryani from the evening buffet. Contains bone-in chicken pieces.",
      category: "cooked_meals",
      quantity: 10,
      quantity_unit: "kg",
      food_type: "non_vegetarian",
      allergens: "Milk (yoghurt marinade)",
      prepared_at: iso(-30),
      safe_until: iso(-24),
      pickup_deadline: iso(-26),
      pickup_address:
        "Green Leaf Hostel, 9, 80 Feet Road, Koramangala, Bengaluru",
      city: "Bengaluru",
      additional_instructions: null,
      status: "expired",
      assigned_ngo_id: null,
    },
    {
      id: "b1000000-0000-4000-8000-000000000007",
      donor_id: ids.donor2,
      title: "Mixed vegetable sandwiches",
      description:
        "Fresh sandwiches prepared for a campus event that was rescheduled. Packed individually and refrigerated.",
      category: "packaged_food",
      quantity: 40,
      quantity_unit: "packs",
      food_type: "vegetarian",
      allergens: "Wheat, milk",
      prepared_at: iso(-1.5),
      safe_until: iso(4),
      pickup_deadline: iso(3),
      pickup_address:
        "Green Leaf Hostel, 9, 80 Feet Road, Koramangala, Bengaluru",
      city: "Bengaluru",
      additional_instructions: "Ask for the hostel mess supervisor.",
      status: "available",
      assigned_ngo_id: null,
    },
    {
      id: "b1000000-0000-4000-8000-000000000008",
      donor_id: ids.donor2,
      title: "Packed snacks and juice",
      description:
        "Sealed snack packs and tetra-pack juice left over from a college workshop. All items are within date.",
      category: "packaged_food",
      quantity: 30,
      quantity_unit: "packs",
      food_type: "vegetarian",
      allergens: "May contain nuts",
      prepared_at: iso(-8),
      safe_until: iso(-2),
      pickup_deadline: iso(-3),
      pickup_address:
        "Green Leaf Hostel, 9, 80 Feet Road, Koramangala, Bengaluru",
      city: "Bengaluru",
      additional_instructions: null,
      status: "collected",
      assigned_ngo_id: ids.ngo,
    },
  ].map((donation) => ({
    ...donation,
    latitude: donationLocations[donation.id]?.[0] ?? null,
    longitude: donationLocations[donation.id]?.[1] ?? null,
  }));
}

function requestData(ids) {
  return [
    {
      id: "c1000000-0000-4000-8000-000000000001",
      donation_id: "b1000000-0000-4000-8000-000000000004",
      ngo_id: ids.ngo,
      requested_quantity: 18,
      message:
        "Annapurna can collect all 18 kg at 6 pm and serve it at our Indiranagar kitchen.",
      status: "accepted",
    },
    {
      id: "c1000000-0000-4000-8000-000000000002",
      donation_id: "b1000000-0000-4000-8000-000000000004",
      ngo_id: ids.ngo4,
      requested_quantity: 10,
      message: "We can take 10 kg for the Koramangala shelter.",
      status: "rejected",
    },
    {
      id: "c1000000-0000-4000-8000-000000000003",
      donation_id: "b1000000-0000-4000-8000-000000000005",
      ngo_id: ids.ngo2,
      requested_quantity: 15,
      message: "Feeding Hands collected this for the Old Madras Road shelter.",
      status: "completed",
    },
    {
      id: "c1000000-0000-4000-8000-000000000004",
      donation_id: "b1000000-0000-4000-8000-000000000001",
      ngo_id: ids.ngo,
      requested_quantity: 12,
      message:
        "We can collect the pulao and raita together in insulated containers.",
      status: "pending",
    },
    {
      id: "c1000000-0000-4000-8000-000000000005",
      donation_id: "b1000000-0000-4000-8000-000000000002",
      ngo_id: ids.ngo2,
      requested_quantity: 6,
      message: "Bread will go to the morning breakfast service.",
      status: "pending",
    },
    {
      id: "c1000000-0000-4000-8000-000000000006",
      donation_id: "b1000000-0000-4000-8000-000000000003",
      ngo_id: ids.ngo4,
      requested_quantity: 9,
      message: "Seva can collect the fruit crates before noon.",
      status: "pending",
    },
    {
      id: "c1000000-0000-4000-8000-000000000007",
      donation_id: "b1000000-0000-4000-8000-000000000007",
      ngo_id: ids.ngo,
      requested_quantity: 25,
      message: "We can distribute 25 packs at the Indiranagar kitchen.",
      status: "pending",
    },
    {
      id: "c1000000-0000-4000-8000-000000000008",
      donation_id: "b1000000-0000-4000-8000-000000000007",
      ngo_id: ids.ngo4,
      requested_quantity: 15,
      message: "Seva can take the remaining 15 packs.",
      status: "pending",
    },
    {
      id: "c1000000-0000-4000-8000-000000000009",
      donation_id: "b1000000-0000-4000-8000-000000000008",
      ngo_id: ids.ngo,
      requested_quantity: 30,
      message: "Collected and distributed with the evening meal.",
      status: "completed",
    },
  ];
}

function recordData(ids) {
  return [
    {
      id: "d1000000-0000-4000-8000-000000000001",
      donation_id: "b1000000-0000-4000-8000-000000000005",
      ngo_id: ids.ngo2,
      donor_id: ids.donor,
      collected_quantity: 15,
      collected_at: iso(-20),
      notes: "Collected in insulated containers and served the same evening.",
    },
    {
      id: "d1000000-0000-4000-8000-000000000002",
      donation_id: "b1000000-0000-4000-8000-000000000008",
      ngo_id: ids.ngo,
      donor_id: ids.donor2,
      collected_quantity: 30,
      collected_at: iso(-2),
      notes: "Distributed with the community dinner.",
    },
  ];
}

async function main() {
  console.log("\nLastPlate sample data (Prisma)\n");

  console.log("Auth accounts");
  const ids = {};
  for (const account of accounts) {
    ids[account.key] = await ensureAuthUser(account);
    console.log(`  ${account.email} (${account.role})`);
  }

  console.log("\nProfiles");
  for (const account of accounts) {
    const data = {
      full_name: account.fullName,
      email: account.email,
      role: account.role,
      organization_name: account.organizationName,
      organization_type: account.organizationType,
      phone: account.phone,
      city: account.city,
      address: account.address,
      latitude: account.latitude ?? null,
      longitude: account.longitude ?? null,
      verification_status: account.verificationStatus,
      registration_number: account.registrationNumber ?? null,
      verification_notes: account.verificationNotes ?? null,
      is_active: true,
      updated_at: new Date(),
    };

    await prisma.profiles.upsert({
      where: { id: ids[account.key] },
      create: { id: ids[account.key], ...data },
      update: data,
    });
  }
  console.log(`  ${accounts.length} organization profiles`);

  console.log("\nDonations");
  const donations = donationData(ids);
  for (const donation of donations) {
    await prisma.donations.upsert({
      where: { id: donation.id },
      create: donation,
      update: donation,
    });
  }
  console.log(`  ${donations.length} donations`);

  console.log("\nCollection requests");
  const requests = requestData(ids);
  const donationIds = donations.map((donation) => donation.id);

  // Reset workflow data attached to the seeded donations so rerunning the seed
  // restores the same demo state instead of leaving extra test requests behind.
  await prisma.collection_records.deleteMany({
    where: { donation_id: { in: donationIds } },
  });
  await prisma.collection_requests.deleteMany({
    where: { donation_id: { in: donationIds } },
  });

  // Sample history includes requests that are already accepted, rejected, or
  // completed. The live guard only allows new requests on available donations,
  // so it is paused while the historical rows are inserted.
  await prisma.$executeRawUnsafe(
    "alter table public.collection_requests disable trigger collection_requests_validate",
  );

  try {
    for (const request of requests) {
      await prisma.collection_requests.upsert({
        where: { id: request.id },
        create: request,
        update: request,
      });
    }
  } finally {
    await prisma.$executeRawUnsafe(
      "alter table public.collection_requests enable trigger collection_requests_validate",
    );
  }
  console.log(`  ${requests.length} collection requests`);

  console.log("\nCollection records");
  const records = recordData(ids);
  for (const record of records) {
    await prisma.collection_records.upsert({
      where: { id: record.id },
      create: record,
      update: record,
    });
  }
  console.log(`  ${records.length} collection records`);

  const sample = [
    "LastPlate sample accounts",
    "=========================",
    "",
    "Local app: http://localhost:3000/login",
    "",
    `Every sample account uses the password: ${PASSWORD}`,
    "",
    "Food donor — Saffron Kitchen",
    `  Email:    ${accounts[0].email}`,
    `  Password: ${PASSWORD}`,
    "",
    "Food donor — Green Leaf Hostel",
    `  Email:    ${accounts[1].email}`,
    `  Password: ${PASSWORD}`,
    "",
    "NGO — Annapurna Trust (verified)",
    `  Email:    ${accounts[2].email}`,
    `  Password: ${PASSWORD}`,
    "",
    "NGO — Feeding Hands Foundation (verified)",
    `  Email:    ${accounts[3].email}`,
    `  Password: ${PASSWORD}`,
    "",
    "NGO — Roti Bank Bengaluru (pending verification)",
    `  Email:    ${accounts[4].email}`,
    `  Password: ${PASSWORD}`,
    "",
    "NGO — Seva Meal Collective (verified)",
    `  Email:    ${accounts[5].email}`,
    `  Password: ${PASSWORD}`,
    "",
    "Administrator — LastPlate Operations",
    `  Email:    ${accounts[6].email}`,
    `  Password: ${PASSWORD}`,
    "",
    "Notes",
    "-----",
    "- These are sample accounts for development and review only.",
    "- Change or delete them before using this project with real organizations.",
    "- The service role key and database password are never included here.",
    "",
  ].join("\n");

  await writeFile(path.join(process.cwd(), "sample.txt"), sample, "utf8");

  console.log("\nDone.");
  console.log("Sample credentials written to sample.txt");
  console.log(
    `Open http://localhost:3000/login and sign in with ${accounts[0].email}\n`,
  );
}

main()
  .catch((error) => {
    console.error(`\nSeed failed: ${error.message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
