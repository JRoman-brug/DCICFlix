import { Suspense } from "react";
import { Navbar } from "../components/Navbar";
import RecomendationsGrid from "../components/RecomendationsGrid";
import RecomendationsGridSkeleton from "../components/RecomendationsGridSkeleton";

function Recomendations() {
  return (
    <>
      <Navbar></Navbar>
      <Suspense fallback={<RecomendationsGridSkeleton />}>
        <RecomendationsGrid />
      </Suspense>
    </>
  );
}

export default Recomendations;
