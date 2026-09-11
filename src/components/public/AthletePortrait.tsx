import { athletePhotoUrl } from "@/lib/athlete-photo";
export function AthletePortrait({
  name,
  url,
  large = false,
}: {
  name: string;
  url: string | null;
  large?: boolean;
}) {
  const image = athletePhotoUrl(url);
  return (
    <div
      role={image ? "img" : undefined}
      aria-label={image ? name : undefined}
      aria-hidden={!image}
      style={
        image ? { backgroundImage: `url(${JSON.stringify(image)})` } : undefined
      }
      className={`flex shrink-0 items-center justify-center border border-white/20 bg-[#141414] bg-cover bg-center font-black text-[#ffd400] ${large ? "h-36 w-36 text-4xl sm:h-48 sm:w-48" : "h-14 w-14 text-lg"}`}
    >
      {!image &&
        name
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((n) => n[0])
          .join("")}
    </div>
  );
}
