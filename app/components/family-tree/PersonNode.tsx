import { Baby, Calendar, Crown, Heart, MapPin, Star, User } from "lucide-react";
import { memo } from "react";

import type { FC } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

export interface Person {
  id: string;
  firstName: string;
  lastName?: string;
  middleName?: string;
  nickname?: string;
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  deathPlace?: string;
  gender?: "male" | "female" | "other" | "unknown";
  photo?: string;
  notes?: string;
  // Enhanced UI properties
  profession?: string;
  spouse?: string;
  isDeceased?: boolean;
  isFounder?: boolean; // Family founder/patriarch/matriarch
  // Canvas positioning
  canvasX?: number;
  canvasY?: number;
  canvasWidth?: number;
  canvasHeight?: number;
  canvasColor?: string;
}

interface PersonNodeProps {
  className?: string;
  person: Person;
  isSelected?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  compact?: boolean;
  showDetailedView?: boolean;
  // Canvas constraints
  containerWidth?: number;
  containerHeight?: number;
}

export const PersonNode: FC<PersonNodeProps> = memo(
  ({
    className,
    person,
    isSelected = false,
    onClick,
    onDoubleClick,
    compact = false,
    showDetailedView = false,
    containerWidth,
    containerHeight,
  }) => {
    const fullName = [person.firstName, person.middleName, person.lastName]
      .filter(Boolean)
      .join(" ");

    const displayName = person.nickname
      ? `${person.firstName} "${person.nickname}" ${person.lastName || ""}`.trim()
      : fullName;

    // Adaptive sizing based on container constraints
    const isSmallContainer = containerWidth && containerWidth < 200;
    const isMediumContainer =
      containerWidth && containerWidth >= 200 && containerWidth < 300;
    const isLargeContainer = containerWidth && containerWidth >= 300;

    // Force compact mode for small containers
    const effectiveCompact = compact || isSmallContainer;

    const formatDate = (dateStr?: string) => {
      if (!dateStr) return "";
      // Handle various date formats (YYYY, YYYY-MM, YYYY-MM-DD)
      if (dateStr.length === 4) return dateStr;
      if (dateStr.length === 7) return dateStr;
      try {
        return new Date(dateStr).getFullYear().toString();
      } catch {
        return dateStr;
      }
    };

    const getLifeSpan = () => {
      const birth = formatDate(person.birthDate);
      const death = formatDate(person.deathDate);
      if (birth && death) return `${birth} - ${death}`;
      if (birth) return `b. ${birth}`;
      if (death) return `d. ${death}`;
      return "";
    };

    const getAge = () => {
      if (!person.birthDate) return null;
      const birthYear = parseInt(person.birthDate.split("-")[0]);
      const currentYear = new Date().getFullYear();
      const deathYear = person.deathDate
        ? parseInt(person.deathDate.split("-")[0])
        : currentYear;
      return deathYear - birthYear;
    };

    const getGenderIcon = () => {
      switch (person.gender) {
        case "male":
          return "👨";
        case "female":
          return "👩";
        default:
          return "👤";
      }
    };

    const getGenderColor = () => {
      switch (person.gender) {
        case "male":
          return "from-blue-50 to-blue-100 border-blue-200";
        case "female":
          return "from-pink-50 to-pink-100 border-pink-200";
        default:
          return "from-gray-50 to-gray-100 border-gray-200";
      }
    };

    const getStatusIcon = () => {
      if (person.isFounder)
        return <Crown className="h-3 w-3 text-yellow-600" />;
      if (person.deathDate) return <Heart className="h-3 w-3 text-gray-500" />;
      return null;
    };

    const getInitials = () => {
      const first = person.firstName?.[0] || "";
      const last = person.lastName?.[0] || "";
      return (first + last).toUpperCase() || "?";
    };

    const getGenderVariant = () => {
      switch (person.gender) {
        case "male":
          return "default" as const;
        case "female":
          return "secondary" as const;
        case "other":
          return "destructive" as const;
        default:
          return "outline" as const;
      }
    };

    if (effectiveCompact) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]",
                  "border-2 hover:border-primary/50 bg-gradient-to-br overflow-hidden",
                  // Dark theme support
                  "dark:bg-gray-800 dark:border-gray-600 dark:hover:border-primary/40",
                  "dark:shadow-gray-900/20",
                  person.canvasColor
                    ? `border-[${person.canvasColor}]`
                    : getGenderColor(),
                  isSelected &&
                    "border-primary shadow-md ring-2 ring-primary/30 scale-[1.02] dark:ring-primary/40",
                  person.deathDate && "opacity-75 dark:opacity-70",
                  className,
                )}
                onClick={onClick}
                onDoubleClick={onDoubleClick}
                style={{
                  backgroundColor: person.canvasColor
                    ? `${person.canvasColor}10`
                    : undefined,
                  width: containerWidth ? `${containerWidth - 8}px` : "auto",
                  height: containerHeight ? `${containerHeight - 8}px` : "auto",
                }}
              >
                <CardContent
                  className={cn(
                    "p-2 space-y-1 flex flex-col justify-center items-center text-center h-full",
                    isSmallContainer && "p-1 space-y-0.5",
                  )}
                >
                  {/* Avatar with status icon */}
                  <div className="relative flex-shrink-0">
                    <Avatar
                      className={cn(
                        "ring-2 ring-white shadow-sm dark:ring-gray-600",
                        isSmallContainer ? "h-6 w-6" : "h-10 w-10",
                      )}
                    >
                      <AvatarImage src={person.photo} alt={displayName} />
                      <AvatarFallback
                        className={cn(
                          "font-medium bg-gradient-to-br from-primary/20 to-primary/40",
                          "dark:from-primary/30 dark:to-primary/50 dark:text-white",
                          isSmallContainer ? "text-xs" : "text-sm",
                        )}
                      >
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    {getStatusIcon() && !isSmallContainer && (
                      <div className="absolute -top-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-sm border dark:border-gray-600">
                        {getStatusIcon()}
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <div className="min-h-0 flex-1 flex flex-col justify-center">
                    <h4
                      className={cn(
                        "font-semibold leading-tight text-gray-900 dark:text-gray-100 line-clamp-2",
                        isSmallContainer ? "text-xs" : "text-sm",
                      )}
                    >
                      {isSmallContainer
                        ? `${person.firstName} ${person.lastName || ""}`.trim()
                        : displayName}
                    </h4>

                    {/* Age/status for medium+ containers */}
                    {!isSmallContainer && getAge() && (
                      <span className="text-xs text-muted-foreground dark:text-gray-400 font-medium mt-0.5">
                        {person.deathDate ? `†${getAge()}` : getAge()}
                      </span>
                    )}
                  </div>

                  {/* Gender badge for larger containers */}
                  {!isSmallContainer && (
                    <Badge
                      variant={getGenderVariant()}
                      className="text-xs px-2 py-0.5 font-medium flex-shrink-0 dark:border-gray-600"
                    >
                      {getGenderIcon()}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className={cn(
                "max-w-sm border shadow-lg z-50 p-0",
                // Match the card styling for consistency
                "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600",
                "dark:shadow-gray-900/40",
              )}
            >
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-white dark:ring-gray-600">
                    <AvatarImage src={person.photo} alt={displayName} />
                    <AvatarFallback className="text-sm font-medium bg-gradient-to-br from-primary/20 to-primary/40 dark:from-primary/30 dark:to-primary/50 dark:text-white">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                      {displayName}
                    </p>
                    {person.profession && (
                      <p className="text-xs text-muted-foreground dark:text-gray-400">
                        {person.profession}
                      </p>
                    )}
                    {getLifeSpan() && (
                      <p className="text-xs text-muted-foreground dark:text-gray-400">
                        {getLifeSpan()} {getAge() && `(${getAge()} years)`}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge
                      variant={getGenderVariant()}
                      className="text-xs dark:border-gray-600"
                    >
                      {getGenderIcon()}
                    </Badge>
                    {getStatusIcon() && (
                      <div className="text-sm">{getStatusIcon()}</div>
                    )}
                  </div>
                </div>

                {person.birthPlace && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground dark:text-gray-400">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">
                      Born in {person.birthPlace}
                    </span>
                  </div>
                )}

                {person.notes && (
                  <p className="text-xs text-muted-foreground dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-2">
                    {person.notes.length > 100
                      ? `${person.notes.substring(0, 100)}...`
                      : person.notes}
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card
              className={cn(
                "w-full cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01]",
                "border-2 hover:border-primary/50 bg-gradient-to-br",
                // Dark theme support
                "dark:bg-gray-800 dark:border-gray-600 dark:hover:border-primary/40",
                "dark:shadow-gray-900/20",
                person.canvasColor
                  ? `border-[${person.canvasColor}]`
                  : getGenderColor(),
                isSelected &&
                  "border-primary shadow-lg ring-2 ring-primary/30 scale-[1.01] dark:ring-primary/40",
                person.deathDate && "opacity-80 dark:opacity-70",
                className,
              )}
              onClick={onClick}
              onDoubleClick={onDoubleClick}
              style={{
                backgroundColor: person.canvasColor
                  ? `${person.canvasColor}15`
                  : undefined,
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16 ring-3 ring-white dark:ring-gray-600 shadow-lg">
                      <AvatarImage src={person.photo} alt={displayName} />
                      <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary/30 to-primary/60 text-white dark:from-primary/40 dark:to-primary/70">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    {getStatusIcon() && (
                      <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md border dark:border-gray-600">
                        {getStatusIcon()}
                      </div>
                    )}
                    {person.deathDate && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-gray-500 dark:bg-gray-600 text-white rounded px-1 py-0.5 text-xs font-medium">
                        ✝
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg leading-tight line-clamp-2 text-gray-900 dark:text-gray-100">
                          {displayName}
                        </h3>
                        {person.profession && (
                          <p className="text-sm text-primary dark:text-primary-400 font-medium italic">
                            {person.profession}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant={getGenderVariant()}
                          className="px-3 py-1 font-medium text-sm dark:border-gray-600"
                        >
                          {getGenderIcon()}
                        </Badge>
                        {getAge() && (
                          <span className="text-sm text-muted-foreground dark:text-gray-400 font-semibold">
                            {person.deathDate
                              ? `Lived ${getAge()} years`
                              : `Age ${getAge()}`}
                          </span>
                        )}
                      </div>
                    </div>

                    {getLifeSpan() && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">{getLifeSpan()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                {/* Location Information */}
                {(person.birthPlace || person.deathPlace) && (
                  <div className="grid gap-2">
                    {person.birthPlace && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                          <Baby className="h-3 w-3 text-green-600" />
                        </div>
                        <span>
                          Born in{" "}
                          <span className="font-medium">
                            {person.birthPlace}
                          </span>
                        </span>
                      </div>
                    )}
                    {person.deathPlace && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full">
                          <Heart className="h-3 w-3 text-gray-600" />
                        </div>
                        <span>
                          Died in{" "}
                          <span className="font-medium">
                            {person.deathPlace}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {person.notes && (
                  <div className="bg-muted/30 rounded-lg p-3 border border-muted">
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                      {person.notes}
                    </p>
                  </div>
                )}

                {/* Enhanced details for detailed view */}
                {showDetailedView && (
                  <div className="border-t pt-3 space-y-2">
                    {person.spouse && (
                      <div className="flex items-center gap-2 text-sm">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-muted-foreground">Spouse:</span>
                        <span className="font-medium">{person.spouse}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>ID: {person.id}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className={cn(
              "max-w-sm border shadow-lg z-50 p-0",
              // Match the card styling for consistency
              "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600",
              "dark:shadow-gray-900/40",
            )}
          >
            <div className="space-y-3 p-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-gray-600">
                  <AvatarImage src={person.photo} alt={displayName} />
                  <AvatarFallback className="text-sm font-medium bg-gradient-to-br from-primary/20 to-primary/40 dark:from-primary/30 dark:to-primary/50 dark:text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-base text-gray-900 dark:text-gray-100">
                    {displayName}
                  </p>
                  {person.profession && (
                    <p className="text-sm text-primary font-medium dark:text-primary-400">
                      {person.profession}
                    </p>
                  )}
                </div>
              </div>
              {getLifeSpan() && (
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Calendar className="h-4 w-4" />
                  <span>{getLifeSpan()}</span>
                  {getAge() && (
                    <span className="text-muted-foreground dark:text-gray-400">
                      ({getAge()} years)
                    </span>
                  )}
                </div>
              )}
              {person.birthPlace && (
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <MapPin className="h-4 w-4" />
                  <span>Born in {person.birthPlace}</span>
                </div>
              )}
              {person.deathPlace && (
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Heart className="h-4 w-4" />
                  <span>Died in {person.deathPlace}</span>
                </div>
              )}
              {person.notes && (
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                  <p className="text-sm text-muted-foreground dark:text-gray-400 leading-relaxed">
                    {person.notes.length > 150
                      ? `${person.notes.substring(0, 150)}...`
                      : person.notes}
                  </p>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);

PersonNode.displayName = "PersonNode";
