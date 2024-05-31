import prisma from "@/lib/prisma";
import isEmpty from "lodash/isEmpty";
import type { Business } from "@prisma/client";

export async function getUserById(id: Business["id"]) {
  try {
    if (isEmpty(id)) {
      return null;
    } else {
      return prisma.business.findUnique({
        where: { id },
        include: {
          affiliate_business: {
            include: {
              affiliate: true,
            },
          },
          products: true,
          orders: true,
        },
      });
    }
  } catch (err) {
    console.log(err);
  }
}

export async function getBusinessBySlug(slug: Business["slug"]) {
  try {
    if (isEmpty(slug)) {
      return null;
    } else {
      return prisma.business.findUnique({
        where: { slug },
        include: {
          affiliate_business: {
            include: {
              affiliate: true,
            },
          },
          products: true,
          orders: true,
        },
      });
    }
  } catch (err) {
    console.log(err);
  }
}

export async function updateBusinessInfoById({
  id,
  first_name,
  last_name,
  description,
  commission,
  wallet_address,
  store_name,
  slug,
}: Omit<
  Business,
  | "created_at"
  | "updated_at"
  | "affiliate_hub_description"
  | "email"
  | "url"
  | "status"
>) {
  try {
    return prisma.business.update({
      where: { id },
      data: {
        first_name,
        last_name,
        description,
        commission,
        wallet_address,
        store_name,
        slug,
      },
    });
  } catch (err) {
    console.log(err);
  }
}
