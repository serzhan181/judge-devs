/* eslint-disable react/display-name */
import { useToast } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { useMemo } from "react";
import { Star } from "react-feather";
import { trpc } from "../utils/trpc";

type RateProjectProps = {
  count?: number;
  rating?: number;
  onRate: (rating: number) => void;
};

export const RateProject = ({
  count = 5,
  rating = 0,
  onRate,
}: RateProjectProps) => {
  const [hoverRating, setHoverRating] = useState(0);

  const filled = useCallback(
    (idx: number) => {
      if (hoverRating >= idx) {
        return "#ddb231";
      } else if (!hoverRating && rating >= idx) return "#ddb231";

      return "transparent";
    },
    [hoverRating, rating]
  );

  const stars = useMemo(() => {
    return Array(count)
      .fill(0)
      .map((_, i) => i + 1)
      .map((idx) => (
        <Star
          key={idx}
          color="#ddb231"
          fill={filled(idx)}
          onClick={() => onRate(idx)}
          onMouseEnter={() => setHoverRating(idx)}
          onMouseLeave={() => setHoverRating(0)}
          cursor="pointer"
        />
      ));
  }, [count, filled, onRate]);

  return <>{stars}</>;
};

export const useRateProject = (userRate: number | null | undefined) => {
  const toast = useToast();
  const session = useSession();

  useEffect(() => {
    if (userRate && typeof userRate === "number") {
      setRating(userRate);
    }
  }, [userRate]);

  const [rating, setRating] = useState(0);

  const rateProject = trpc.project.rate.useMutation();

  const onRate = (rating: number, projectId: string) => {
    if (!session?.data)
      return toast({
        status: "error",
        description: "You have to be signed in.",
      });

    if (rating > 5) {
      toast({
        status: "error",
        description: "You cannot rate more than 5 star!",
      });
      return;
    }

    if (rateProject.isLoading) {
      return;
    }

    if (rating === userRate) return;

    setRating(rating);

    rateProject.mutate(
      { projectId, rating },
      {
        onSuccess(data) {
          toast({
            status: "success",
            description: `you rated ${data?.value} star${
              data && data.value > 1 ? "s" : ""
            }`,
          });
        },
        onError(err) {
          console.log("something went wrong...", err);

          toast({
            status: "error",
            title: "Server Error",
            description: "could'nt vote",
          });
        },
      }
    );
  };

  return { rating, onRate };
};
