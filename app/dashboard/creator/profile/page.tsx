import { requireSession } from "@/features/auth/service"
import { getCreatorByUserId } from "@/features/profiles/service"
import { redirect } from "next/navigation"
import { EditProfileForm } from "@/components/creator/edit-profile-form"
import { PlatformManager } from "@/components/creator/platform-manager"

export default async function CreatorProfilePage() {
  const user = await requireSession("CREATOR")
  const creator = await getCreatorByUserId(user.id)

  if (!creator?.creatorProfile) {
    redirect("/onboarding/creator")
  }

  const profile = {
    name: creator.name,
    bio: creator.creatorProfile.bio,
    niches: creator.creatorProfile.niches,
    location: creator.creatorProfile.location,
    mediaKitUrl: creator.creatorProfile.mediaKitUrl,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your profile info and social platforms</p>
      </div>
      <EditProfileForm profile={profile} />
      <PlatformManager platforms={creator.creatorProfile.platforms} />
    </div>
  )
}
