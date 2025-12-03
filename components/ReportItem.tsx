'use client';

import { useState } from 'react';
import { TemperatureReport } from '@/lib/supabase-api';
import { format } from 'date-fns';
import { Trash2, ChevronDown } from 'lucide-react';

interface ReportItemProps {
    report: TemperatureReport;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onDelete: () => void;
}

export default function ReportItem({ report, isExpanded, onToggleExpand, onDelete }: ReportItemProps) {
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const [isSwiped, setIsSwiped] = useState(false);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            setIsSwiped(true);
        }
        if (isRightSwipe) {
            setIsSwiped(false);
        }
    };

    return (
        <div className="relative mb-4 overflow-hidden rounded-lg">
            {/* Delete Background Layer */}
            <div className="absolute inset-y-0 right-0 w-20 bg-red-500 flex items-center justify-center rounded-r-lg z-0">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="w-full h-full flex items-center justify-center text-white"
                >
                    <Trash2 className="w-6 h-6" />
                </button>
            </div>

            {/* Foreground Content Layer */}
            <div
                className={`relative bg-white border-2 border-slate-200 rounded-lg transition-transform duration-300 ease-out z-10 ${isSwiped ? '-translate-x-20' : 'translate-x-0'
                    }`}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {/* Report Header */}
                <div
                    className="bg-slate-50 p-4 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={onToggleExpand}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm font-semibold text-slate-700">
                                    👤: {report.submitter_name || 'Unknown'}
                                </span>
                                <span className="text-xs text-slate-500">
                                    📅: {format(new Date(report.created_at), 'MMM d, yyyy HH:mm')}
                                </span>
                            </div>

                            {report.remarks && (
                                <div className="text-sm text-slate-600">
                                    <span className="font-medium">Remarks:</span> {report.remarks}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Desktop Delete Button (hidden on mobile if swiped, or just keep it?) 
                  User asked to hide delete button in a slide. I'll hide the default delete button 
                  and only show the chevron.
              */}
                            <ChevronDown
                                className={`w-5 h-5 text-slate-500 transition-transform ${isExpanded ? 'transform rotate-180' : ''
                                    }`}
                            />
                        </div>
                    </div>
                </div>

                {/* Report Details (Expandable) */}
                {isExpanded && report.entries && (
                    <div className="p-4 bg-white border-t-2 border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Fridge Status Details</h3>

                        {/* Group entries by section */}
                        {(() => {
                            const entriesBySection: Record<string, typeof report.entries> = {};
                            report.entries?.forEach((entry) => {
                                const sectionName = entry.fridge?.section?.name || 'Unknown Section';
                                if (!entriesBySection[sectionName]) {
                                    entriesBySection[sectionName] = [];
                                }
                                entriesBySection[sectionName].push(entry);
                            });

                            return (
                                <div className="space-y-4">
                                    {Object.entries(entriesBySection).map(([sectionName, sectionEntries]) => (
                                        <div key={sectionName} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                                            <h4 className="font-semibold text-slate-800 mb-3">{sectionName}</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                {sectionEntries.map((entry) => (
                                                    <div
                                                        key={entry.id}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg ${entry.temperature_in_range
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : 'bg-red-100 text-red-800'
                                                            }`}
                                                    >
                                                        <span className="text-lg">
                                                            {entry.temperature_in_range ? '✓' : '✗'}
                                                        </span>
                                                        <span className="text-sm font-medium">
                                                            {entry.fridge?.name || 'Unknown Fridge'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}

                        {/* Summary Statistics */}
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="bg-emerald-50 rounded-lg p-3">
                                    <div className="text-2xl font-bold text-emerald-700">
                                        {report.entries?.filter((e) => e.temperature_in_range).length || 0}
                                    </div>
                                    <div className="text-xs text-emerald-600 font-medium">In Range</div>
                                </div>
                                <div className="bg-red-50 rounded-lg p-3">
                                    <div className="text-2xl font-bold text-red-700">
                                        {report.entries?.filter((e) => !e.temperature_in_range).length || 0}
                                    </div>
                                    <div className="text-xs text-red-600 font-medium">Requires Attention</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
