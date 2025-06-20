"use client";

import { Select } from "@radix-ui/themes";
import { useRouter, useSearchParams } from "next/navigation";

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Open", value: "OPEN" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Closed", value: "CLOSED" },
];

const IssueStatusFilter = () => {
  const router = useRouter();

  return (
    <Select.Root
      onValueChange={(status) => {
        const query = status ? `?status=${status}` : "";
        router.push("/issues/list" + query);
      }}
    >
      <Select.Trigger placeholder="Filter by status..." />
      <Select.Content>
        {statusOptions.map((option) => (
          <Select.Item key={option.value} value={option.value}>
            {option.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
};

export default IssueStatusFilter;
