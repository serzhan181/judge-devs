import { DefaultLayout } from "@/src/layouts/default";
import { useRouter } from "next/router";

const UserPage = () => {
  const router = useRouter();
  const userId = router.query.id as string;

  return <DefaultLayout>Black people {userId}</DefaultLayout>;
};

export default UserPage;
