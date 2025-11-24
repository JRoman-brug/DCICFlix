import { Navbar as HeroNavbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import { UserIcon } from "lucide-react";
import dciflixLogo from "../assets/dciflix-logo.png";

export const Navbar = () => {
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
            <UserIcon className="text-white w-7 h-7 cursor-pointer" />
            </NavbarItem>
        </NavbarContent>
        </HeroNavbar>
    );
};
