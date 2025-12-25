"use client";

import React, { useState, useEffect } from 'react';
import { Select, Slider, Checkbox, Button, Badge, Drawer } from 'antd';
import { FilterOutlined, CloseOutlined } from '@ant-design/icons';
import { BundleFilterParams, getSubjects, getLessons, getExamTypes } from '@/services/bundleService';
import { SubjectDto, LessonDto, ExamType } from '@/types';

interface BundleFiltersProps {
    filters: BundleFilterParams;
    onFilterChange: (filters: BundleFilterParams) => void;
    onClearFilters: () => void;
    isMobile?: boolean; // Add isMobile to interface
}

/**
 * BundleFilters Component
 * Comprehensive filter panel for paper bundles
 * Features:
 * - Paper type, exam type, subject, lesson filters
 * - Past paper toggle
 * - Price range slider
 * - Active filter count badge
 * - Clear all filters
 * - Mobile-friendly drawer
 */
export const BundleFilters: React.FC<BundleFiltersProps> = ({
    filters,
    onFilterChange,
    onClearFilters,
    isMobile = false,
}) => {
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [subjects, setSubjects] = useState<SubjectDto[]>([]);
    const [allLessons, setAllLessons] = useState<LessonDto[]>([]);
    const [examTypes, setExamTypes] = useState<ExamType[]>([]);
    const [filteredLessons, setFilteredLessons] = useState<LessonDto[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subjectsData, lessonsData, examTypesData] = await Promise.all([
                    getSubjects(),
                    getLessons(),
                    getExamTypes()
                ]);
                setSubjects(subjectsData);
                setAllLessons(lessonsData);
                setExamTypes(examTypesData);
            } catch (error) {
                console.error('Failed to fetch filter data:', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (filters.subjectId) {
            const filtered = allLessons.filter(l => l.subjectId === filters.subjectId);
            setFilteredLessons(filtered);
        } else {
            setFilteredLessons([]);
        }
    }, [filters.subjectId, allLessons]);

    const handleFilterChange = (key: keyof BundleFilterParams, value: any) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const activeFilterCount = Object.values(filters).filter(
        (value) => value !== undefined && value !== null && value !== ''
    ).length;

    const filterContent = (
        <div className="space-y-4">
            {/* Paper Type Filter */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Paper Type
                </label>
                <Select
                    placeholder="All Types"
                    value={filters.type}
                    onChange={(value) => handleFilterChange('type', value)}
                    className="w-full"
                    size="large"
                    allowClear
                >
                    <Select.Option value="MCQ">Multiple Choice</Select.Option>
                    <Select.Option value="ESSAY">Essay</Select.Option>
                    <Select.Option value="MIXED">Mixed</Select.Option>
                </Select>
            </div>

            {/* Exam Type Filter */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Exam Type
                </label>
                <Select
                    placeholder="All Exams"
                    value={filters.examTypeId}
                    onChange={(value) => handleFilterChange('examTypeId', value)}
                    className="w-full"
                    size="large"
                    allowClear
                >
                    {examTypes.map(exam => (
                        <Select.Option key={exam.id} value={exam.id}>{exam.name}</Select.Option>
                    ))}
                </Select>
            </div>

            {/* Subject Filter */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject
                </label>
                <Select
                    placeholder="All Subjects"
                    value={filters.subjectId || undefined}
                    onChange={(value) => {
                        console.log('Subject changed to:', value);
                        // Update both subjectId and reset lessonId in a single call
                        onFilterChange({ ...filters, subjectId: value, lessonId: undefined });
                    }}
                    className="w-full"
                    size="large"
                    allowClear
                >
                    {subjects.map(subject => (
                        <Select.Option key={subject.id} value={subject.id}>{subject.name}</Select.Option>
                    ))}
                </Select>
            </div>

            {/* Lesson Filter */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lesson
                </label>
                <Select
                    placeholder={filters.subjectId ? "All Lessons" : "Select a Subject first"}
                    value={filters.lessonId || undefined}
                    onChange={(value) => {
                        console.log('Lesson changed to:', value);
                        handleFilterChange('lessonId', value);
                    }}
                    className="w-full"
                    size="large"
                    allowClear
                    disabled={!filters.subjectId}
                >
                    {filteredLessons.map(lesson => (
                        <Select.Option key={lesson.id} value={lesson.id}>{lesson.name}</Select.Option>
                    ))}
                </Select>
            </div>

            {/* Past Paper Toggle */}
            <div className="pt-2">
                <Checkbox
                    checked={filters.isPastPaper}
                    onChange={(e) => handleFilterChange('isPastPaper', e.target.checked ? true : undefined)}
                >
                    <span className="text-sm font-semibold text-gray-700">
                        Past Papers Only
                    </span>
                </Checkbox>
            </div>

            {/* Price Range Filter */}
            <div className="pt-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price Range
                </label>
                <Slider
                    range
                    min={0}
                    max={200}
                    step={5}
                    value={[filters.minPrice || 0, filters.maxPrice || 200]}
                    onChange={(value) => {
                        handleFilterChange('minPrice', value[0] === 0 ? undefined : value[0]);
                        handleFilterChange('maxPrice', value[1] === 200 ? undefined : value[1]);
                    }}
                    marks={{
                        0: '$0',
                        50: '$50',
                        100: '$100',
                        150: '$150',
                        200: '$200',
                    }}
                    className="mb-8"
                />
                <div className="flex justify-between text-sm text-gray-600">
                    <span>${filters.minPrice || 0}</span>
                    <span>${filters.maxPrice || 200}</span>
                </div>
            </div>

            {/* Clear Filters Button */}
            {activeFilterCount > 0 && (
                <Button
                    type="default"
                    danger
                    block
                    size="large"
                    icon={<CloseOutlined />}
                    onClick={() => {
                        onClearFilters();
                        if (isMobile) setDrawerVisible(false);
                    }}
                    className="mt-4"
                >
                    Clear All Filters ({activeFilterCount})
                </Button>
            )}
        </div>
    );

    // Mobile: Show drawer with filter button
    if (isMobile) {
        return (
            <>
                <Button
                    type="primary"
                    size="large"
                    icon={<FilterOutlined />}
                    onClick={() => setDrawerVisible(true)}
                    className="w-full"
                >
                    <Badge count={activeFilterCount} offset={[10, 0]}>
                        Filters
                    </Badge>
                </Button>
                <Drawer
                    title="Filter Bundles"
                    placement="right"
                    onClose={() => setDrawerVisible(false)}
                    open={drawerVisible}
                    width={320}
                >
                    {filterContent}
                </Drawer>
            </>
        );
    }

    // Desktop: Show filters inline
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FilterOutlined className="text-primary-600" />
                    Filters
                    {activeFilterCount > 0 && (
                        <Badge count={activeFilterCount} className="ml-2" />
                    )}
                </h3>
            </div>
            {filterContent}
        </div>
    );
};

export default BundleFilters;
