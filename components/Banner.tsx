import React from "react";

type Props = {};

const Banner = (props: Props) => {
  return (
    <div className="flex justify-between items-center bg-yellow-400 border-y border-black py-10 lg:py-0">
      <div className="px-10 space-y-5">
        <h1 className="text-6xl max-w-xl font-serif">
          <span className="underline decoration-black decoration-4">
            Medium
          </span>{" "}
          is a place to write, read and comment
        </h1>
        <h2>
          Its easy and free to post your thinking on any topic and connect with
          mils of users
        </h2>
      </div>
        <img className="hidden md:inline-flex h-32 lg:h-full" src="https://accountabilitylab.org/wp-content/uploads/2020/03/Medium-logo.png"/>
    </div>
  );
};

export default Banner;
