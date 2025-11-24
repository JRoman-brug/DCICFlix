import {
  addToast,
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import { LogOutIcon, UserIcon } from "lucide-react";
import dciflixLogo from "../assets/dciflix-logo.png";
import { useAuth } from "../context/authContext";
import { Link } from "react-router-dom";
import type { User } from "../services/auth/auth.types";
import ConfirmModal from "./modals/confirmModal";
import { logout as logoutServices } from "../services/auth/auth.services";

const ProfileSection = ({ userData }: { userData: User | null }) => {
  const { logout } = useAuth();
  const onLogout = async () => {
    try {
      await logoutServices(); //Request to backend
      logout(); // update context
      addToast({ title: "Logout successfully", color: "success" });
    } catch (err) {
      console.log(err);
    }
  };
  if (!userData)
    return (
      <Link to={"/login"}>
        <UserIcon />
      </Link>
    );
  return (
    <div className="flex items-center text-2xl gap-3">
      <p>{userData.email.split("@")[0]}</p>
      <ConfirmModal
        title="Are you want logout"
        message="Are you want logout"
        iconButton={<LogOutIcon size={32} color="white" />}
        handler={onLogout}
      />
    </div>
  );
};

export const Navbar = () => {
  const { user } = useAuth();
  return (
    <HeroNavbar
      maxWidth="xl"
      position="static"
      className="bg-black text-white border-b border-zinc-800"
    >
      <NavbarBrand>
        <img
          src={dciflixLogo}
          alt="DCIFLIX"
          className="h-10 sm:h-12 object-contain"
        />
      </NavbarBrand>

      <NavbarContent justify="end">
        <NavbarItem>
          <ProfileSection userData={user} />
        </NavbarItem>
      </NavbarContent>
    </HeroNavbar>
  );
};
