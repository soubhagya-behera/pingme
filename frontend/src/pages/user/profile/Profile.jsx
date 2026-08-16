import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Camera, Trash2, X } from "lucide-react";

import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Avatar from "../../../components/ui/Avatar";
import ProfileService from "../../../services/ProfileService";
import { useAuth } from "../../../context/AuthContext";

const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

export default function Profile() {
  const { register, handleSubmit, reset } = useForm();
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState({});
  const [photoLoading, setPhotoLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function loadProfile() {
    try {
      const response = await ProfileService.getProfile();
      const data = response.data.data;
      setProfile(data);
      reset(data);
    } catch {
      toast.error("Unable to load profile");
    }
  }

  async function onSubmit(data) {
    try {
      await ProfileService.updateProfile(data);
      toast.success("Profile Updated");
    } catch {
      toast.error("Update Failed");
    }
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      toast.error("Please choose a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      toast.error("Image must be 5 MB or smaller.");
      return;
    }
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function cancelPreview() {
    setPreviewFile(null);
    setPreviewUrl("");
  }

  async function uploadPhoto() {
    if (!previewFile) return;
    setPhotoLoading(true);
    try {
      const response = await ProfileService.uploadProfilePhoto(previewFile);
      const data = response.data.data;
      setProfile(data);
      reset(data);
      updateUser({ profilePicture: data.profilePicture });
      toast.success("Profile photo updated");
      cancelPreview();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to update profile photo"
      );
    } finally {
      setPhotoLoading(false);
    }
  }

  async function removePhoto() {
    setPhotoLoading(true);
    try {
      const response = await ProfileService.removeProfilePhoto();
      const data = response.data.data;
      setProfile(data);
      reset(data);
      updateUser({ profilePicture: data.profilePicture });
      toast.success("Profile photo removed");
      cancelPreview();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to remove profile photo"
      );
    } finally {
      setPhotoLoading(false);
    }
  }

  const hasPhoto = Boolean(profile.profilePicture);

  return (
    <Card className="p-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">My Profile</h1>

      <div className="profile-photo-section">
        {previewFile ? (
          <img
            src={previewUrl}
            alt="Profile photo preview"
            className="profile-photo-preview"
          />
        ) : (
          <Avatar
            name={profile.fullName}
            src={profile.profilePicture}
            size={112}
          />
        )}

        <div className="profile-photo-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          {previewFile ? (
            <>
              <Button
                variant="secondary"
                onClick={cancelPreview}
                disabled={photoLoading}
              >
                <X size={18} />
                Cancel
              </Button>
              <Button onClick={uploadPhoto} disabled={photoLoading}>
                {photoLoading ? "Uploading..." : "Save Photo"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={photoLoading}
              >
                <Camera size={18} />
                Change Photo
              </Button>
              {hasPhoto && (
                <Button
                  variant="danger"
                  onClick={removePhoto}
                  disabled={photoLoading}
                >
                  <Trash2 size={18} />
                  {photoLoading ? "Removing..." : "Remove Photo"}
                </Button>
              )}
            </>
          )}
        </div>
        <p className="profile-photo-hint">
          JPG, PNG, or WEBP. Maximum 5 MB.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input placeholder="Full Name" {...register("fullName")} />
        <Input placeholder="Profession" {...register("profession")} />
        <Input placeholder="Bio" {...register("bio")} />
        <Input placeholder="Phone" {...register("phone")} />

        <Button type="submit" className="w-full">
          Save Changes
        </Button>
      </form>
    </Card>
  );
}