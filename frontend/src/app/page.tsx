"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Flex, Box } from "@chakra-ui/react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FrequenciesGrid from "@/components/FrequenciesGrid";
import RolesGrid from "../components/RolesGrid";
import RoleSelectionModal from "@/components/RoleSelectionModal";
import "./globals.css";
import io from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import { Socket } from "socket.io-client"; // Import Socket type from socket.io-client

import { observable, configure } from "mobx";
import { model as baseModel } from "../models/Model";
import App from "./app";
const Page: React.FC = () => {
  //Bootstrap application-level state
  configure({ enforceActions: "never" });
  const model = observable(baseModel);

  return (
    <div>
      <Toaster />
      <App model={model} />
    </div>
  );
};

export default Page;
