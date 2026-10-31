import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";

function News() {
  const [data, setData] = useState([]);
  const [loading, setIsloading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try{
        setIsloading(true);
        const response = await axios.get("https://jsonplaceholder.typicode.com/posts");
        const data = response.data;
        setData(data);
        setIsloading(false);
        console.log(data);
      } catch (error) {
        console.error("Error fetching news:", error);
        setIsloading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <>
    <br />
     { loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500 text-lg">Loading news...</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 py-10">

  <h1 className="text-4xl font-bold text-center mb-10">
    Latest News
  </h1>

  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

  {data.map((item) => (

    <div
      key={item.id}
      className="overflow-hidden rounded-3xl bg-white shadow-lg"
    >

      <img
        src={/* Sidee image-ka u sameyn lahayd? */`https://picsum.photos/400/300?random=${item.id}`}
        alt=""
        className="w-full h-56 object-cover"
      />

      <div className="p-5">

        <h2 className="font-bold text-xl">
          {item.title}
        </h2>

        <p>
          {item.id}
        </p>

        <button className="mt-4 w-full bg-black text-white py-2 rounded-xl">
          Read More
        </button>

      </div>

    </div>

  ))}

</div>

</div>
      )}
      <br />
    </>
  );
}

export default News;