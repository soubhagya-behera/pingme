import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import ProfileService from "../../services/ProfileService";

export default function Profile() {
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const response = await ProfileService.getProfile();
      reset(response.data.data);
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

  return (
    <Card className="p-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">My Profile</h1>

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