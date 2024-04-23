import DashboardModel from "@/models/DashboardModel";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Button, ButtonGroup, Switch } from "@chakra-ui/react";

const DashboardSetActive = observer(
  (props: { model: typeof DashboardModel }) => {
    return <></>;
  }
);

export default DashboardSetActive;
