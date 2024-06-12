"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader } from "lucide-react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import toast, { Toaster } from "react-hot-toast";
import { createAffiliateAction } from "./actions";
import { Navigation } from "./components/header";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { IconBrandGoogle, IconBrandInstagram } from "@tabler/icons-react";
import Link from "next/link";
import { CoolMode } from "@/components/magic-ui/cool-mode";

const FormSchema = z.object({
  firstname: z.string().min(1, {
    message: "Please enter the first name.",
  }),
  lastname: z.string().min(1, {
    message: "Please enter the last name.",
  }),
  email: z.string().min(1, {
    message: "Please enter the email.",
  }),
  description: z.string().min(1, {
    message: "Please enter the dsecription.",
  }),
  wallet: z.string().min(1, {
    message: "Please enter the wallet.",
  }),
  url: z.string().min(1, {
    message: "Please enter the url.",
  }),
  youtube: z.string(),
  instagram: z.string(),
});

type AllowedFormKey =
  | "firstname"
  | "lastname"
  | "email"
  | "description"
  | "wallet"
  | "url"
  | "youtube"
  | "instagram";

export default function Affiliates({ params }: { params: { slug: string } }) {
  const [mangosqueezyAI, setMangosqueezyAI] = React.useState("");
  const [isButtonLoading, setIsButtonLoading] = React.useState(false);
  const [isAILoading, setIsAILoading] = React.useState(false);
  const searchParams = useSearchParams();
  const supabase = createClient();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      url: "",
      youtube: "",
      instagram: "",
      wallet: "",
      description: "",
    },
  });

  const updateLocalStorage = React.useCallback(
    () => localStorage.setItem("affiliate-form-details", JSON.stringify(form.getValues())),
    [form]
  );

  React.useEffect(() => {
    if (form.formState.isValidating) {
      localStorage.setItem("affiliate-form-details", JSON.stringify(form.getValues()));
    }
  }, [form, form.formState.isValidating]);

  const connectGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `https://mangosqueezy.com/auth/${params.slug}/provider`,
        scopes: "https://www.googleapis.com/auth/youtube.readonly",
      },
    });
  };

  React.useEffect(() => {
    if (localStorage.getItem("affiliate-form-details")) {
      const affiliateDetails = localStorage.getItem("affiliate-form-details") as string;
      const parsedAffiliateDetails = JSON.parse(affiliateDetails);

      for (let item in parsedAffiliateDetails) {
        const key = item as AllowedFormKey;
        form.setValue(key, parsedAffiliateDetails[key]);
      }
    }
  }, [form]);

  React.useEffect(() => {
    const ytChannelId = searchParams.get("ytChannelId");
    if (ytChannelId) {
      form.setValue("youtube", ytChannelId);
      updateLocalStorage();
    }
  }, [form, searchParams, updateLocalStorage]);

  React.useEffect(() => {
    const fetchAccessToken = async () => {
      const { hash } = window.location;
      if (hash) {
        const params = new URLSearchParams(hash.slice(1));
        const accessToken = params.get("access_token") as string;
        const longLivedToken = params.get("long_lived_token") as string;
        const state = params.get("state") as string;

        const parameters = {
          accessToken,
          longLivedToken,
          state,
        };

        const queryParameter = new URLSearchParams(parameters);
        const response = await fetch(
          `https://mangosqueezy.com/api/instagram/callback?${queryParameter.toString()}`,
          {
            method: "GET",
          }
        );
        const result: { igUsername: string } = await response.json();
        form.setValue("instagram", result.igUsername);
        updateLocalStorage();
      }
    };
    fetchAccessToken();
  }, [form, updateLocalStorage]);

  const callMangosqueezyAI = React.useCallback(
    async (query: string) => {
      setIsAILoading(true);

      const formData = new FormData();
      formData.append("query", query);
      formData.append("text", form.getValues("description"));

      const response = await fetch("https://mangosqueezy.com/api/llm", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      form.setValue("description", result);
      updateLocalStorage();

      setIsAILoading(false);
    },
    [form, updateLocalStorage]
  );

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const formData = new FormData();

    formData.append("firstname", data.firstname);
    formData.append("lastname", data.lastname);
    formData.append("email", data.email);
    formData.append("description", data.description);
    formData.append("wallet", data.wallet);
    formData.append("url", data.url);
    formData.append("youtube", data.youtube);
    formData.append("instagram", data.instagram);
    formData.append("company-slug", params.slug);

    setIsButtonLoading(true);
    const result = await createAffiliateAction(formData);
    if (result === "success") {
      toast.success("Successfully created your account");
      form.reset();
      localStorage.removeItem("affiliate-form-details");
    } else if (result === "exists") {
      toast.success("Account is already created");
      form.reset();
      localStorage.removeItem("affiliate-form-details");
    } else {
      toast.error("Something went wrong please try again later");
    }
    setIsButtonLoading(false);
  }

  return (
    <>
      <Toaster position="top-right" />

      <header className="flex h-16 items-center gap-4 border-b px-4 md:px-6">
        <div className="flex flex-col w-full mx-auto">
          <Navigation />
        </div>
      </header>
      <div className="flex min-h-screen w-full flex-col justify-center items-center">
        <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] max-w-7xl flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
          <h1 className="text-3xl font-semibold tracking-normal">Affiliates</h1>
          <h3 className="text-xl font-semibold tracking-normal">
            Ready to earn in crypto. Tell us something about you!!
          </h3>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
              <div className="grid grid-cols-2 gap-3 space-y-0">
                <FormField
                  control={form.control}
                  name="firstname"
                  render={({ field }) => (
                    <>
                      <FormItem>
                        <FormLabel className="truncate text-black">First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Mango" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastname"
                  render={({ field }) => (
                    <>
                      <FormItem>
                        <FormLabel className="truncate text-black">Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Squeezy" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 space-y-0">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <>
                      <FormItem>
                        <FormLabel className="truncate text-black">Email</FormLabel>
                        <FormControl>
                          <Input placeholder="hello-user@mangosqueezy.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </>
                  )}
                />

                <FormField
                  control={form.control}
                  name="wallet"
                  render={({ field }) => (
                    <>
                      <FormItem>
                        <FormLabel className="truncate text-black flex items-center">
                          Wallet Address
                          <Link href="https://xumm.app/" target="_blank" rel="noreferrer">
                            <InformationCircleIcon className="size-5 ml-1 text-green-600" />
                          </Link>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="rXRPLWalletAddress" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </>
                  )}
                />
              </div>

              <div className="grid grid-col-1 lg:grid-cols-3 gap-3 space-y-0">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <>
                      <FormItem>
                        <FormLabel className="truncate text-black">Website</FormLabel>
                        <FormControl>
                          <Input placeholder="www.any-link.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </>
                  )}
                />

                <FormField
                  control={form.control}
                  name="youtube"
                  render={({ field }) => (
                    <>
                      <FormItem>
                        <FormLabel className="truncate text-black">Youtube</FormLabel>
                        <div className="flex">
                          <Button type="button" variant="outline" onClick={() => connectGoogle()}>
                            <IconBrandGoogle className="h-4 w-4 mr-2 text-blue-500" />
                            Connect Google
                          </Button>

                          <FormControl className="ml-3">
                            <Input
                              className="font-bold text-orange-900"
                              disabled
                              placeholder="@youtuber"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    </>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instagram"
                  render={({ field }) => (
                    <>
                      <FormItem>
                        <FormLabel className="truncate text-black">Instagram</FormLabel>
                        <div className="flex">
                          <Button variant="outline" asChild>
                            <a
                              href={`https://www.facebook.com/v20.0/dialog/oauth?client_id=678555187581833&display=page&extras={"setup":{"channel":"IG_API_ONBOARDING"}}&redirect_uri=https://mangosqueezy.com/join/${params.slug}&response_type=token&scope=instagram_basic&state={"slug":"${params.slug}"}`}
                            >
                              <IconBrandInstagram className="h-4 w-4 mr-2 text-red-500" />
                              Connect Instagram
                            </a>
                          </Button>

                          <FormControl className="ml-3">
                            <Input
                              className="font-bold text-orange-900"
                              disabled
                              placeholder="@mangosqueezy"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    </>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <>
                    <FormItem>
                      <FormLabel className="truncate text-black">Description</FormLabel>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild className="ml-3">
                          <Button variant="outline" size="icon">
                            {isAILoading ? (
                              <Loader className="size-4 animate-spin" />
                            ) : (
                              <Sparkles className="size-4 text-yellow-600" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                          <DropdownMenuLabel>AI Prompts</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuRadioGroup
                            value={mangosqueezyAI}
                            onValueChange={setMangosqueezyAI}
                          >
                            <DropdownMenuRadioItem
                              value="fix-grammar"
                              onClick={() => callMangosqueezyAI("fix grammar")}
                            >
                              Fix Grammar
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem
                              value="improve-writing"
                              onClick={() => callMangosqueezyAI("improve writing")}
                            >
                              Improve writing
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem
                              value="rephrase"
                              onClick={() => callMangosqueezyAI("rephrase")}
                            >
                              Rephrase
                            </DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <FormControl>
                        <Textarea
                          placeholder="Get more customers by using affiliate marketing. This helps you make more money, get more people buying from you, and build lasting relationships with your partners' followers."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </>
                )}
              />

              <CoolMode>
                <Button
                  disabled={isButtonLoading}
                  className={cn(isButtonLoading ? "cursor-not-allowed" : "cursor-pointer")}
                  type="submit"
                >
                  Save
                  {isButtonLoading && <Loader className="size-5 ml-2 animate-spin" />}
                </Button>
              </CoolMode>
            </form>
          </Form>
        </main>
      </div>
    </>
  );
}