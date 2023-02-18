import { SideCard } from "../molecules/side-card";
import { trpc } from "../utils/trpc";

export const PopularSideCard = () => {
  const { data, isLoading } = trpc.project.getPopular.useQuery();

  return (
    <SideCard
      title="Popular projects"
      //   THAT IS UGLY, IM SORRY I WILL CHANGE IT!!!!
      projects={
        data?.map((p) => ({
          averageRating: p.average_rating,
          id: p.id,
          imageSrc: p.image || "/static/images/website-placeholder.jpg",
          name: p.name,
        })) || []
      }
    />
  );
};
