import CourseCard from "../components/CourseCard";
import { getAllCoursesApi } from "../api/courseApi";
import { useEffect } from "react";
import { useCart } from "../context/CartContext";


const courses = await getAllCoursesApi();


export default function Home() {
  const {loadCart}= useCart()

  // cart data fetch fro backedn 
useEffect(() => {
  loadCart();
}, [loadCart]);



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
        Popular Courses
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <CourseCard key={course._id} {...course} />
        ))}
      </div>
    </div>
  );
}
