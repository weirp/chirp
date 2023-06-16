import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import Head from "next/head";
import { PageLayout } from "~/components/layout";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { api } from "~/utils/api";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postview";


const ProfileFeed = (props: {userId: string}) => {

  const {data, isLoading} = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingPage/>
  if (!data || data.length === 0) return <div>User has not posted</div>


  return <div className="flex flex-col">
    {data.map(fullPost => (
      <PostView {...fullPost} key={fullPost.post.id} />
    ))}
  </div>
};


type PageProps =InferGetStaticPropsType<typeof getStaticProps>;

const ProfilePage: NextPage<{ username: string }>  = ({username}) => {
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
          <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};


export const getStaticProps: GetStaticProps  = async (context) => {
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
