import { Table } from "@radix-ui/themes";
import { prisma } from "@/prisma/client";
import { IssueStatusBadge, Link } from "@/app/components";
import NextLink from "next/link";
import IssueActions from "./IssueActions";
import { Issue, Status } from "@prisma/client";
import { ArrowUpIcon } from "@radix-ui/react-icons";
import { headers } from "next/headers";
import { parse } from "querystring";
import Pagination from "@/app/components/Pagination";

interface Props {
  searchParams: {
    page: string;
  };
}

const IssuesPage = async ({ searchParams }: Props) => {
  const columns: { label: string; value: keyof Issue; className?: string }[] = [
    { label: "Issue", value: "title" },
    { label: "Status", value: "status", className: "hidden md:table-cell" },
    { label: "Created", value: "createdAt", className: "hidden md:table-cell" },
  ];

  // Obtener query string desde el header y parsearlo
  const headerList = headers();
  const url = (await headerList).get("x-next-url") || "";
  const queryString = url.split("?")[1] || "";
  const queryParams = parse(queryString);

  const rawStatus = Array.isArray(queryParams.status)
    ? queryParams.status[0]
    : queryParams.status;
  const rawOrderBy = Array.isArray(queryParams.orderBy)
    ? queryParams.orderBy[0]
    : queryParams.orderBy;

  const status =
    rawStatus && Object.values(Status).includes(rawStatus as Status)
      ? (rawStatus as Status)
      : undefined;
  const where = { status };

  const orderByValue =
    rawOrderBy && columns.some((col) => col.value === rawOrderBy)
      ? (rawOrderBy as keyof Issue)
      : undefined;

  const orderBy = orderByValue ? { [orderByValue]: "asc" as const } : undefined;

  const page = parseInt(searchParams.page) || 1;
  const pageSize = 10;

  const issues = await prisma.issue.findMany({
    where,
    orderBy,
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const issueCount = await prisma.issue.count({ where });

  return (
    <div>
      <IssueActions />
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            {columns.map((column) => {
              const query: Record<string, string> = {};
              if (status) query.status = status;
              query.orderBy = column.value;

              return (
                <Table.ColumnHeaderCell
                  key={column.value}
                  className={column.className}
                >
                  <NextLink href={{ pathname: "/issues/list", query }}>
                    {column.label}
                  </NextLink>
                  {column.value === orderByValue && (
                    <ArrowUpIcon className="inline" />
                  )}
                </Table.ColumnHeaderCell>
              );
            })}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {issues.map((issue) => (
            <Table.Row key={issue.id}>
              <Table.Cell>
                <Link href={`/issues/${issue.id}`}>{issue.title}</Link>
                <div className="block md:hidden">
                  <IssueStatusBadge status={issue.status} />
                </div>
              </Table.Cell>
              <Table.Cell className="hidden md:table-cell">
                <IssueStatusBadge status={issue.status} />
              </Table.Cell>
              <Table.Cell className="hidden md:table-cell">
                {issue.createdAt.toDateString()}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Pagination
        pageSize={pageSize}
        currentPage={page}
        itemCount={issueCount}
      />
    </div>
  );
};

export const dynamic = "force-dynamic";
export default IssuesPage;
