import Image, { type StaticImageData } from "next/image";
import horizontalLogo from "@/logo/logo-horizontal.png";
import stackedLogo from "@/logo/logo-stacked.png";
import masterIcon from "@/logo/icon-master.png";

type BrandLogoVariant = "horizontal" | "stacked" | "mark";

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  alt?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

const logoAssets: Record<BrandLogoVariant, StaticImageData> = {
  horizontal: horizontalLogo,
  stacked: stackedLogo,
  mark: masterIcon,
};

/** Shared logo lockups for navigation, brand surfaces and the footer. */
export default function BrandLogo({
  variant = "horizontal",
  alt = "ArgyMetrics",
  className,
  priority = false,
  sizes,
}: BrandLogoProps) {
  const asset = logoAssets[variant];

  return (
    <Image
      src={asset}
      alt={alt}
      width={asset.width}
      height={asset.height}
      priority={priority}
      sizes={sizes}
      className={className}
    />
  );
}
