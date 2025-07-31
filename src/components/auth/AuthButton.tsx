import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut } from "lucide-react";
import SignInPopup from "@/components/SignInPopup";

interface AuthButtonProps {
  openSignIn?: () => void;
}

export const AuthButton = ({ openSignIn }: AuthButtonProps = {}) => {
  const { user, signOut } = useAuth();
  const [isSignInPopupOpen, setIsSignInPopupOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) {
    return (
      <>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              if (openSignIn) {
                openSignIn();
              } else {
                setIsSignInPopupOpen(true);
              }
            }}
          >
            Sign In
          </Button>
          <Link to="/signup">
            <Button>Join Now</Button>
          </Link>
        </div>
        {!openSignIn && (
          <SignInPopup
            isOpen={isSignInPopupOpen}
            onClose={() => setIsSignInPopupOpen(false)}
          />
        )}
      </>
    );
  }

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url} alt="User" />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.email}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.user_metadata?.full_name || user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
