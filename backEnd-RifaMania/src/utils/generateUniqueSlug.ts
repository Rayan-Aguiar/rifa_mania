import slugify from "slugify";
import { prisma } from "../lib/prisma";

export async function generateUniqueSlug(name: string): Promise<string>{
    const baseSlug = slugify(name,{lower: true})
    let slug = baseSlug
    let counter = 1

    while (await prisma.raffle.findUnique({where: {uniqueLink: slug}})){
        slug = `${baseSlug}-${counter}`
        counter++;
    }
    return slug
}