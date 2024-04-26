import RootLayout from "@/app/layout";
import theme from "@/app/theme";
import DashboardApp from "@/components/dashboard/DashboardApp";
import { Flex, Box, ChakraProvider } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { observable, configure } from "mobx";
import dashboardModel from "@/models/DashboardModel";
import DashboardSocketHandler from "@/components/dashboard/DashboardSocketHandler";
import { Toaster } from "react-hot-toast";

/*function SetActiveButton() {
  return <button onClick={}></button>;
}*/

const Dashboard = () => {
  configure({ enforceActions: "never" });
  const model = observable(dashboardModel);
  return (
    <ChakraProvider theme={theme}>
      <Toaster position={"bottom-right"} />
      <DashboardSocketHandler model={model} />
      <DashboardApp model={model} />
    </ChakraProvider>
  );
};

export default Dashboard;
