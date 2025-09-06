"use client";

import type React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NeumorphicButton } from "./neumorphic-button";
import { Heading } from "./heading";

export function SubmitForm() {
  const [formData, setFormData] = useState({
    name: "",
    founded: "",
    shutDown: "",
    industry: "",
    country: "",
    funding: "",
    causeOfShutdown: "",
    articleUrl: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      "Thank you for your submission! (This is a demo - data not actually saved)"
    );
    setFormData({
      name: "",
      founded: "",
      shutDown: "",
      industry: "",
      country: "",
      funding: "",
      causeOfShutdown: "",
      articleUrl: "",
      description: "",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="neumorphic-card p-6 md:p-8 max-w-4xl mx-auto">
      <Heading level={2} className="mb-6 text-center text-white">
        Submit a Failed Startup
      </Heading>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="font-dm-sans font-medium text-white"
            >
              Startup Name *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="bg-black border-white/20 focus:border-white text-white placeholder:text-white/50"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="industry"
              className="font-dm-sans font-medium text-white"
            >
              Industry *
            </Label>
            <Input
              id="industry"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              required
              className="bg-black border-white/20 focus:border-white text-white placeholder:text-white/50"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="founded"
              className="font-dm-sans font-medium text-white"
            >
              Founded Year *
            </Label>
            <Input
              id="founded"
              name="founded"
              type="number"
              value={formData.founded}
              onChange={handleChange}
              required
              className="bg-black border-white/20 focus:border-white text-white placeholder:text-white/50"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="shutDown"
              className="font-dm-sans font-medium text-white"
            >
              Shut Down Year *
            </Label>
            <Input
              id="shutDown"
              name="shutDown"
              type="number"
              value={formData.shutDown}
              onChange={handleChange}
              required
              className="bg-black border-white/20 focus:border-white text-white placeholder:text-white/50"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="country"
              className="font-dm-sans font-medium text-white"
            >
              Country *
            </Label>
            <Input
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="bg-black border-white/20 focus:border-white text-white placeholder:text-white/50"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="funding"
              className="font-dm-sans font-medium text-white"
            >
              Total Funding *
            </Label>
            <Input
              id="funding"
              name="funding"
              value={formData.funding}
              onChange={handleChange}
              placeholder="e.g., $10M, $1.5B, Bootstrapped"
              required
              className="bg-black border-white/20 focus:border-white text-white placeholder:text-white/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="causeOfShutdown"
            className="font-dm-sans font-medium text-white"
          >
            Cause of Shutdown *
          </Label>
          <Input
            id="causeOfShutdown"
            name="causeOfShutdown"
            value={formData.causeOfShutdown}
            onChange={handleChange}
            placeholder="Brief reason for failure"
            required
            className="bg-black border-white/20 focus:border-white text-white placeholder:text-white/50"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="articleUrl"
            className="font-dm-sans font-medium text-white"
          >
            Article URL (Optional)
          </Label>
          <Input
            id="articleUrl"
            name="articleUrl"
            type="url"
            value={formData.articleUrl}
            onChange={handleChange}
            placeholder="Link to article about the shutdown"
            className="bg-black border-white/20 focus:border-white text-white placeholder:text-white/50"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="description"
            className="font-dm-sans font-medium text-white"
          >
            Description (Optional)
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of what the startup did"
            rows={4}
            className="bg-black border-white/20 focus:border-white text-white placeholder:text-white/50 resize-none"
          />
        </div>

        <div className="flex justify-center pt-4">
          <NeumorphicButton type="submit" size="lg">
            Submit Startup
          </NeumorphicButton>
        </div>
      </form>
    </div>
  );
}
