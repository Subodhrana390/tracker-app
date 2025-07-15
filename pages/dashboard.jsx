import React from "react";
import DailyDiariesPage from "@/components/daily-diaries";
import withAuth from "@/components/withAuth";
import TrainingCertificate from "@/components/TrainingCertificate";
import ProjectList from "@/components/ProjectList";
import ShowFinalReport from "@/components/ShowFinalReport";

const Dashboard = () => {
  return (
    <main className="flex-grow p-8">
      <DailyDiariesPage />
      <TrainingCertificate />
      <ShowFinalReport />
      <ProjectList />
    </main>
  );
};

export default withAuth(Dashboard);
