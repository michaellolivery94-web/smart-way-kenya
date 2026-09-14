import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import Traffic from "@/pages/Traffic";
import CorridorDetail from "@/pages/CorridorDetail";
import { CORRIDORS } from "@/data/corridors";

vi.mock("@/hooks/useLiveTraffic", () => ({
  useLiveTraffic: () => ({ readings: [], liveCount: 0, isLoading: false, refresh: vi.fn() }),
}));

const LocationProbe = () => {
  const loc = useLocation();
  return <div data-testid="location">{`${loc.pathname}${loc.search}`}</div>;
};

const firstSlug = CORRIDORS[0].slug;

const corridorLink = (slug: string) =>
  screen.getAllByRole("link").find((a) => a.getAttribute("href")?.includes(`/traffic/${slug}`))!;

describe("mode-aware corridor deep links", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("links corridors with the commuter mode by default", () => {
    render(
      <MemoryRouter initialEntries={["/traffic"]}>
        <Traffic />
      </MemoryRouter>,
    );
    expect(corridorLink(firstSlug).getAttribute("href")).toBe(`/traffic/${firstSlug}?mode=commuter`);
  });

  it("switches corridor links to pro mode when Pro Driver is selected", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/traffic"]}>
        <Traffic />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole("tab", { name: "Pro Driver" }));
    expect(corridorLink(firstSlug).getAttribute("href")).toBe(`/traffic/${firstSlug}?mode=pro`);
  });

  it("drops the mode param in compare view", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/traffic"]}>
        <Traffic />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole("tab", { name: "Compare" }));
    expect(corridorLink(firstSlug).getAttribute("href")).toBe(`/traffic/${firstSlug}`);
  });

  it("carries pro mode from the corridor page into the map deep link", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={[`/traffic/${firstSlug}?mode=pro`]}>
        <LocationProbe />
        <Routes>
          <Route path="/traffic/:slug" element={<CorridorDetail />} />
          <Route path="/" element={<div>map</div>} />
        </Routes>
      </MemoryRouter>,
    );
    const button = screen.getByRole("button", { name: /Open .* on the map/i });
    expect(within(button).getByText(/Pro Driver Mode/)).toBeInTheDocument();
    await user.click(button);
    expect(screen.getByTestId("location").textContent).toBe(
      `/?corridor=${firstSlug}&mode=pro`,
    );
  });

  it("defaults the corridor page to commuter mode when no mode is given", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={[`/traffic/${firstSlug}`]}>
        <LocationProbe />
        <Routes>
          <Route path="/traffic/:slug" element={<CorridorDetail />} />
          <Route path="/" element={<div>map</div>} />
        </Routes>
      </MemoryRouter>,
    );
    await user.click(screen.getByRole("button", { name: /Open .* on the map/i }));
    expect(screen.getByTestId("location").textContent).toBe(
      `/?corridor=${firstSlug}&mode=commuter`,
    );
  });

  it("keeps the mode on other-corridor links", () => {
    render(
      <MemoryRouter initialEntries={[`/traffic/${firstSlug}?mode=pro`]}>
        <Routes>
          <Route path="/traffic/:slug" element={<CorridorDetail />} />
        </Routes>
      </MemoryRouter>,
    );
    const other = CORRIDORS.find((c) => c.slug !== firstSlug)!;
    expect(corridorLink(other.slug).getAttribute("href")).toBe(`/traffic/${other.slug}?mode=pro`);
  });
});
