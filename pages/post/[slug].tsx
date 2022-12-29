import { GetStaticProps } from "next";
import { stringify } from "querystring";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { SubmitHandler } from "react-hook-form/dist/types";
import PortableText from "react-portable-text";
import { json } from "stream/consumers";
import Header from "../../components/Header";
import { sanityClient, urlFor } from "../../sanity";
import { Post } from "../../typings";

interface Props {
  post: Post;
}
interface IFormInputs {
  _id: string;
  name: string;
  email: string;
  comment: string;
}

const PostPage = ({ post }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>();
  const [submitted, setSubmitted] = useState(false);
  console.log(post);
  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    console.log(data);
    await fetch("/api/createComment", {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then(() => {
        console.log(data);
        setSubmitted(true);
      })
      .catch((err) => {
        console.log(err);
        setSubmitted(false);
      });
  };

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
        <h1 className="text-xl font-light text-gray-500 mb-2">
          {post.description}
        </h1>
        <div className="flex items-center space-x-2">
          <img
            className="w-10 h-10 rounded-full"
            src={urlFor(post.author.image).url()}
          />
          <p className="font-extralight text-sm inline">
            Blog post by{" "}
            <span className="text-green-500">{post.author.name} </span>-
            Published at {new Date(post._createdAt).getFullYear()}
          </p>
        </div>

        <div className="mt-10">
          <PortableText
            content={post.body}
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
            serializers={{
              h1: (props: any) => (
                <h1 className="text-2xl font-bold my-5"> {...props}</h1>
              ),
              h2: (props: any) => (
                <h1 className="text-xl font-bold my-5"> {...props}</h1>
              ),
              li: ({ children }: any) => (
                <li className="ml-4 list-disc"> {children}</li>
              ),
              link: ({ href, children }: any) => (
                <a href={href} className="text-blue-500 hover:underline">
                  {children}
                </a>
              ),
            }}
          />
        </div>
      </article>

      <hr className="max-w-lg my-5 mx-auto border border-yellow-500" />

      {submitted ? (
        <div className="flex flex-col p-10 my-10 bg-yellow-500 text-white max-w-2xl mx-auto ">
          <h3 className="text-3xl font-bold">Thank you for submitting</h3>
          <p>Once it has been approved, it will appear below</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col p-5 my-10 max-w-2xl mx-auto mb-10"
        >
          <h3 className="text-sm text-yellow-500">Enjoyed this article?</h3>
          <h4 className="text-3xl font-bold">Leave a comment below!</h4>
          <hr className="py-4 mt-2" />

          <input
            {...register("_id")}
            type="hidden"
            name="_id"
            value={post._id}
          />

          <label className="block mb-5">
            <span className="text-gray-700">Name</span>
            <input
              className="shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500 outline-none focus:ring"
              type="text"
              {...register("name", { required: true })}
              placeholder="John AppleSeed"
            />
          </label>
          <label className="block mb-5">
            <span className="text-gray-700">Email</span>
            <input
              {...register("email", { required: true })}
              className="shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500 outline-none focus:ring"
              type="email"
              placeholder="John AppleSeed"
            />
          </label>
          <label className="block mb-5">
            <span className="text-gray-700">Comment</span>
            <textarea
              {...register("comment", { required: true })}
              className="shadow border rounded py-2 px-3 form-textarea mt-1 block w-full ring-yellow-500 outline-none focus:ring"
              rows={8}
              placeholder="John AppleSeed"
            />
          </label>

          <div className="flex flex-col p-5">
            {errors.name && (
              <span className="text-red-500">- The Name field is required</span>
            )}
            {errors.comment && (
              <span className="text-red-500">
                - The Comment field is required
              </span>
            )}
            {errors.email && (
              <span className="text-red-500">
                - The Email field is required
              </span>
            )}
          </div>

          <input
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded cursor-pointer"
          />
        </form>
      )}

      <div className="flex flex-col p-10 my-10 max-w-2xl mx-auto shadow-yellow-500 shadow space-y-2">
        <h3 className="text-4xl">Comments</h3>
        <hr className="pb-2"/>
      
      {post.comments.map(comment => (
        <div key={comment._id}>
          <p><span className="text-yellow-500">{comment.name}</span>: {comment.comment}</p>
        </div>
      ))}
      </div>
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
        'comments': *[
          _type=="comment" &&
          post._ref == ^._id &&
          approved == true],
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
