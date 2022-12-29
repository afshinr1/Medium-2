import { GetStaticProps } from "next";
import React from "react";
import Header from "../../components/Header";
import { sanityClient, urlFor } from "../../sanity";
import { Post } from "../../typings";

interface Props {
  post: Post;
}

const PostPage = ({ post }: Props) => {
  console.log(post);
  return (
    <div>
      <Header />
      <img
        className="h-40 w-full object-cover "
        src={urlFor(post.mainImage).url()}
        alt="jaja"
      />

      <article className="max-w-3xl mx-auto p-5 border border-red-300">
        <h1 className="text-4xl mt-10 mb-3">{post.title}</h1>
        <h1 className="text-xl font-light text-gray-500 mb-2">{post.description}</h1>
        <div className="flex items-center space-x-2">
          <img className="w-10 h-10 rounded-full" src={urlFor(post.author.image).url() }/>
          <p className="font-extralight text-sm inline">Blog post by <span className="text-green-500">{post.author.name} </span>- Published at {new Date(post._createdAt).toLocaleString()}</p>
        </div>
      </article>
    </div>
  );
};

export default PostPage;

export const getStaticProps: GetStaticProps = async (context) => {
  let params = context.params;
  const query = `*[_type == "post" && slug.current == $slug][0] {
        _id,
        _createdAt,
        title,
        author -> {
          name,
          image
        },
        description,
        mainImage,
        slug,
        body
      }`;

  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  });

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
    },
    revalidate: 60,
  };
};

export const getStaticPaths = async () => {
  const query = `*[_type == "post"] {
        _id,
        slug {
            current
        }
      }`;

  const queriedPosts = await sanityClient.fetch(query);

  const paths = queriedPosts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }));

  return {
    paths,
    fallback: "blocking",
  };
};
