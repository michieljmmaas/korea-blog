"use client";

import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import type { TripDay, CityLocation } from "@/app/types";
import DayCard from "./day-card";

const TOOLTIP_OFFSET = 14;

// Subset of TripDay serialized into data-day-info by processDayReferences
export interface DayHoverData {
    date: string;            // frontmatter.date  e.g. "2024-08-01"
    formattedDate: string;   // e.g. "2024-08-01"
    day: number;
    title: string;
    description: string;
    icon: string;
    location: CityLocation;
    stats: TripDay["frontmatter"]["stats"];
    tags: string[];
}

function hoverDataToTripDay(data: DayHoverData): TripDay {
    return {
        day: data.day,
        date: new Date(data.date),
        formattedDate: data.formattedDate,
        fullDate: data.date,
        fileName: "",
        content: "",
        frontmatter: {
            date: data.date,
            day: data.day,
            title: data.title,
            description: data.description,
            icon: data.icon,
            location: data.location,
            stats: data.stats,
            // fields DayCard doesn't render — safe defaults
            draft: false,
            dayOfWeek: "",
            photos: [],
            tags: data.tags,
            thumbnail: "",
            coordinates: { lat: null, lng: null },
            work: false,
        },
    };
}

interface DayLinkWithTooltipProps {
    data: DayHoverData;
    href?: string;
    label: string;
}

export function DayLinkWithTooltip({ data, href, label }: DayLinkWithTooltipProps) {
    const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
    const [visible, setVisible] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const computePos = useCallback((mouseX: number, mouseY: number) => {
        const cardW = cardRef.current?.offsetWidth ?? 480;
        const cardH = cardRef.current?.offsetHeight ?? 280;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let x = mouseX + TOOLTIP_OFFSET;
        let y = mouseY + TOOLTIP_OFFSET;
        if (x + cardW > vw - 8) x = mouseX - cardW - TOOLTIP_OFFSET;
        if (y + cardH > vh - 8) y = mouseY - cardH - TOOLTIP_OFFSET;
        return { x, y };
    }, []);

    const handleMouseEnter = (e: React.MouseEvent) => {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        showTimer.current = setTimeout(() => {
            setPos(computePos(e.clientX, e.clientY));
            setVisible(true);
        }, 100);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!visible) return;
        setPos(computePos(e.clientX, e.clientY));
    };

    const handleMouseLeave = () => {
        if (showTimer.current) clearTimeout(showTimer.current);
        hideTimer.current = setTimeout(() => {
            setVisible(false);
            setTimeout(() => setPos(null), 150);
        }, 60);
    };

    const sharedProps = {
        className: "dayLink",
        onMouseEnter: handleMouseEnter,
        onMouseMove: handleMouseMove,
        onMouseLeave: handleMouseLeave,
    };

    const tooltip = pos && createPortal(
        <div
            ref={cardRef}
            style={{
                position: "fixed",
                left: pos.x,
                top: pos.y,
                zIndex: 9999,
                pointerEvents: "none",
                width: 480,
                transition: "opacity 150ms ease, transform 150ms ease",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0) scale(1)" : "translateY(4px) scale(0.97)",
            }}
        >
            <DayCard day={hoverDataToTripDay(data)} />
        </div>,
        document.body
    );

    return (
        <>
            {href
                ? <a href={href} {...sharedProps}>{label}</a>
                : <span {...sharedProps}>{label}</span>
            }
            {tooltip}
        </>
    );
}