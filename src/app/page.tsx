"use client";

import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    slug: "",
    firstUrl: "",
    nextUrl: "",
  });
  const [result, setResult] = useState<{ slug: string; link: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/redirects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create redirect");
      }

      const data = await response.json();
      setResult(data);
      setFormData({ slug: "", firstUrl: "", nextUrl: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const generateRandomSlug = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, slug: result });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <div className="flex justify-between items-center mb-4">
            <div></div>
            <a
              href="/urls"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Manage URLs →
            </a>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Smart Redirect System
          </h1>
          <p className="text-gray-600 mb-8">
            Create conditional redirects that behave differently on first vs
            subsequent visits
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Slug
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 93D34"
                  required
                />
                <button
                  type="button"
                  onClick={generateRandomSlug}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Random
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="firstUrl"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                First Visit URL
              </label>
              <input
                type="url"
                id="firstUrl"
                value={formData.firstUrl}
                onChange={(e) =>
                  setFormData({ ...formData, firstUrl: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://calendly.com/xyz"
                required
              />
            </div>

            <div>
              <label
                htmlFor="nextUrl"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Subsequent Visits URL
              </label>
              <input
                type="url"
                id="nextUrl"
                value={formData.nextUrl}
                onChange={(e) =>
                  setFormData({ ...formData, nextUrl: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://your-second-destination.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Redirect"}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="text-green-800 font-medium mb-2">
                Redirect Created!
              </h3>
              <p className="text-green-700 text-sm mb-2">
                <strong>Slug:</strong> {result.slug}
              </p>
              <p className="text-green-700 text-sm mb-2">
                <strong>Link:</strong>
              </p>
              <div className="bg-white p-2 rounded border">
                <code className="text-sm text-gray-800 break-all">
                  {result.link}
                </code>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(result.link)}
                className="mt-2 text-green-600 hover:text-green-800 text-sm underline"
              >
                Copy to clipboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
