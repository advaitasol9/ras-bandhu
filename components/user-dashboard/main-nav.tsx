import Link from "next/link";
import { cn } from "@/lib/utils";

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  showMentorshipCallBtn?: boolean;
}

export function MainNav({
  className,
  currentTab,
  setCurrentTab,
  showMentorshipCallBtn = false,
  ...props
}: MainNavProps) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="#"
        className={`text-sm font-medium transition-colors hover:text-primary ${
          currentTab == "evaluations"
            ? "text-primary-text"
            : "text-muted-foreground"
        }`}
        onClick={() => setCurrentTab("evaluations")}
      >
        Answer-Evaluation
      </Link>
      <Link
        href="#"
        className={`text-sm font-medium transition-colors hover:text-primary ${
          currentTab == "myPlans"
            ? "text-primary-text"
            : "text-muted-foreground"
        }`}
        onClick={() => setCurrentTab("myPlans")}
      >
        My-Plan
      </Link>
      {showMentorshipCallBtn && (
        <Link
          href="#"
          className={`text-sm font-medium transition-colors hover:text-primary ${
            currentTab == "mentorshipCall"
              ? "text-primary-text"
              : "text-muted-foreground"
          }`}
          onClick={() => setCurrentTab("mentorshipCall")}
        >
          Mentorship-Call
        </Link>
      )}
    </nav>
  );
}
