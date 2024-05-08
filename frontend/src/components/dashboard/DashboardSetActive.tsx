import DashboardModel from "@/models/DashboardModel";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Button, ButtonGroup, Switch, Stack, Box } from "@chakra-ui/react";

// Component for setting a configuration as active or inactive, toggling its status
const DashboardSetActive = observer(
  (props: { model: typeof DashboardModel }) => {
    const { model } = props;
    const [isClicked, setIsClicked] = useState(false);
    const handleClick = () => {
      model.setActiveConfig(model.selectedConfigurationId || 0);
      //setIsClicked(!isClicked);
    };

    if (model.activeConfigId === model.selectedConfigurationId) return <></>;
    return (
      <>
        <Stack direction="row" spacing={4} align="center">
          <Button
            colorScheme={isClicked ? "turquoise" : "#718096"}
            variant={isClicked ? "solid" : "outline"}
            size="lg"
            onClick={handleClick}
            position="absolute"
            top="10px"
            left="10px"
          >
            {isClicked ? "Active" : "Set to Active"} {}
          </Button>
        </Stack>
      </>
    );
  }
);

export default DashboardSetActive;
