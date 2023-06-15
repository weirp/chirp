import type { InferGetStaticPropsType, NextPage } from "next";
import Head from "next/head";
import { PageLayout } from "~/components/layout";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { api } from "~/utils/api";
import Image from "next/image";

const propicsize = 128;

type PageProps =InferGetStaticPropsType<typeof getStaticProps>;

const ProfilePage: NextPage<PageProps> = ({username}) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (!data) return <div>404</div>;

  console.log(data);

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="border-slate-400 h-36 bg-slate-600 relative">
          <Image 
            src={data.profileImageUrl}
            alt={`${data.username ?? ""}'s profile pic missing`}
            width={128}
            height={128}
            className="-mb-[64px] absolute bottom-0 left-0 ml-4 
              rounded-full border-4 border-black bg-black"
            />
          </div>
          <div className="h-[64px] "></div>
          <div className="p-4 text-2xl font-bold">{`@${data.username ?? ""}`}</div>
          <div className="border-b border-slate-400 w-full"></div>
      </PageLayout>
    </>
  );
};


export const getStaticProps  = async (context) => {
  const ssg = generateSSGHelper();
  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};


export default ProfilePage;
