export const computeAverageRating = async (projectId: string) => {
  let average_rating = null;

  const projectRatings = await prisma?.rating.findMany({
    where: { projectId: projectId },
    select: { value: true },
  });

  if (projectRatings?.length) {
    const ratingsCount = projectRatings.length;
    const ratingsTotal = projectRatings.reduce((acc, r) => acc + r.value, 0);

    average_rating = ratingsTotal / ratingsCount;
  }

  return average_rating;
};
