"use client"
import CategoryChart from "./components/CategoryChart";
import ProductOverview from "./components/ProductOverview";
import ResendTransactions from "./components/ResendTransactions";
import StockSummaryTable from "./components/StockSummaryTable";
import Wrapper from "./components/Wrapper";
import { useUser } from "@clerk/nextjs";

export default function Home() {
      const { user } = useUser()
    const email = user?.primaryEmailAddress?.emailAddress

    if(!email) return
    
  return (
    <Wrapper>
      <div className="flex flex-col md:flex-row">
        <div className="md:w-2/3">
        <ProductOverview email={email} />
        <CategoryChart email={email} />
        <ResendTransactions email={email} />
        </div>
        <div className="md:ml-4 md:mt-0 mt-4 md:w-1/3">
        <StockSummaryTable email={email} />
        </div>
      </div>
    </Wrapper>
  );
}
