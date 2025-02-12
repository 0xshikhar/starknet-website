/**
 * Module dependencies.
 */
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Grid,
  HStack,
  Heading,
  Img,
  useBreakpointValue,
} from "@chakra-ui/react";

import { Category } from "@starknet-io/cms-data/src/categories";
import {
  Configure,
  InstantSearch,
  useHits,
} from "react-instantsearch-hooks-web";
import { Post } from "@starknet-io/cms-data/src/posts";
import { TableOfContents } from "src/pages/(components)/TableOfContents/TableOfContents";
import { Text } from "@ui/Typography/Text";
import { Topic } from "@starknet-io/cms-data/src/topics";
import { Block } from "src/blocks/Block";
import { YoutubePlayer } from "@ui/YoutubePlayer/YoutubePlayer";
import { useMemo } from "react";
import { blocksToTOC } from "src/pages/(components)/TableOfContents/blocksToTOC";
import moment from "moment";
import qs from "qs";
import algoliasearch from "algoliasearch";
import { BlogCard } from "@ui/Blog/BlogCard";
import { BlogHit } from "../PostsPage";
import { BlogBreadcrumbs } from "@ui/Blog/BlogBreadcrumbs";
import SocialShare from "./SocialShare/SocialShare";
import { LatestAnnouncements } from "@starknet-io/cms-data/src/settings/latest-announcements";
import LatestAnnouncement from "@ui/LatestAnnouncement/LatestAnnouncement";

export interface Props {
  readonly params: LocaleParams & {
    readonly slug: string;
  };
  readonly categories: readonly Category[];
  readonly topics: readonly Topic[];
  readonly latestAnnouncements: readonly LatestAnnouncements[];
  readonly post: Post;
  readonly env?: {
    readonly ALGOLIA_INDEX: string;
    readonly ALGOLIA_APP_ID: string;
    readonly ALGOLIA_SEARCH_API_KEY: string;
    readonly SITE_URL: string;
  };
}

/**
 * Export `MarkdownBlock` type.
 */

export interface MarkdownBlock {
  readonly type: "markdown";
  readonly body: string;
}

/**
 * Export `PostPage` component.
 */
enum GridAreas {
  BREADCRUMBS = "breadcrumbs",
  POST = "post",
  LATEST_ANNOUNCEMENT = "latestAnnouncement",
  TIMELINE = "timeline",
}
export function PostPage({
  params: { slug, locale },
  categories,
  topics,
  latestAnnouncements,
  post,
  env,
}: Props): JSX.Element {
  const postCategories = categories.filter((c) => post.category.includes(c.id));
  const videoId = post.post_type !== "article" ? post.video?.id : undefined;
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const isTablet = useBreakpointValue({ base: true, xl: false });
  const searchClient = useMemo(() => {
    return algoliasearch(
      env?.ALGOLIA_APP_ID ?? "",
      env?.ALGOLIA_SEARCH_API_KEY ?? ""
    );
  }, [env?.ALGOLIA_APP_ID, env?.ALGOLIA_SEARCH_API_KEY]);

  return (
    <Container py="0" pb="16" maxW={"1624px"} position="relative">
      <Grid
        position="relative"
        gridTemplateAreas={{
          base: `"${GridAreas.BREADCRUMBS}" "${GridAreas.POST}" "${GridAreas.LATEST_ANNOUNCEMENT}"`,
          lg: `". ${GridAreas.BREADCRUMBS} ." "${GridAreas.TIMELINE} ${GridAreas.POST} ${GridAreas.LATEST_ANNOUNCEMENT}"`,
        }}
        gridTemplateColumns={{
          base: "1fr",
          lg: "240px 1fr 300px",
        }}
        gridColumnGap={{ base: "105px", xl: "40px", "2xl": "80px" }}
      >
        <BlogBreadcrumbs
          gridArea={GridAreas.BREADCRUMBS}
          height={{
            base: "68px",
            lg: "118px",
          }}
          alignItems={"center"}
          locale={locale}
          title={post.title}
        />

        {!!post.toc && !isMobile ? (
          <Box
            alignSelf={"start"}
            gridArea={GridAreas.TIMELINE}
            as={"aside"}
            role={"complementary"}
            position={"sticky"}
            top={"100px"}
          >
            <TableOfContents headings={blocksToTOC(post.blocks, 1)} />
          </Box>
        ) : null}

        <Box gridArea={GridAreas.POST} overflow={"hidden"}>
          <Box maxWidth="1024px">
            {post.post_type === "article" ? (
              <Box>
                <Img
                  borderRadius={"8px"}
                  src={post.image}
                  alt={post.title}
                  width={"100%"}
                />

                <Flex
                  alignItems={{
                    base: "start",
                    md: "center",
                  }}
                  flexDirection={{
                    base: "column",
                    md: "row",
                  }}
                  height={{
                    base: "unset",
                    md: "60px",
                  }}
                  justifyContent={{
                    base: "unset",
                    md: "space-between",
                  }}
                  margin={{
                    base: "16px 0 32px",
                    md: "0",
                  }}
                  rowGap={"16px"}
                >
                  <HStack>
                    <Text fontSize="sm" color="muted">
                      {moment(post.published_date).format("MMM DD,YYYY")} ·
                    </Text>

                    <Text fontSize="sm" color="muted">
                      {post.timeToConsume}
                    </Text>
                  </HStack>

                  <Text fontSize={"sm"} color={"muted"}>
                    {`Page last updated ${moment(
                      post?.gitlog?.date
                    ).fromNow()}`}
                  </Text>
                </Flex>
              </Box>
            ) : null}

            <Heading
              as={"h1"}
              color="heading-navy-fg"
              fontSize={"40px"}
              marginBottom={"48px"}
              variant="h2"
            >
              {post.title}
            </Heading>

            {post.post_desc && (
              <Heading size={"20px"} marginBottom={"56px"} variant="h4">
                {post.post_desc}
              </Heading>
            )}
            {isTablet && (
              <Flex alignItems={"center"} gap={"8px"}>
                <SocialShare params={{ slug, locale }} />
              </Flex>
            )}
            <Divider mt={{ base: "56px", xl: "8px" }} mb="48px" />

            {post.post_type !== "article" && (
              <Flex mb={!post.blocks?.length ? "32px" : 0} direction="column">
                <YoutubePlayer videoId={videoId} />

                <Flex
                  alignItems={"center"}
                  height={"60px"}
                  justifyContent={"space-between"}
                  marginTop={"-50px"}
                >
                  <HStack>
                    <Text fontSize="sm" color="muted">
                      {moment(post.published_date).format("MMM DD,YYYY")} ·
                    </Text>

                    <Text fontSize="sm" color="muted">
                      {post.timeToConsume}
                    </Text>
                  </HStack>

                  <Text fontSize={"sm"} color={"muted"}>
                    {`Page last updated ${moment(
                      post?.gitlog?.date
                    ).fromNow()}`}
                  </Text>
                </Flex>
              </Flex>
            )}
            {(post.blocks?.length ?? 0) > 0 && (
              <Flex direction="column" gap="32px" marginBottom={"96px"}>
                {post.blocks?.map((block, i) => (
                  <Block disallowH1 key={i} block={block} locale={locale} />
                ))}
              </Flex>
            )}

            <Flex direction={"row"} gap={"12px"} marginBottom={"48px"}>
              {post.topic?.map((topic, i) => (
                <Button
                  key={i}
                  variant={"smallFilter"}
                  as={"a"}
                  href={`/content/category/all?${qs.stringify({
                    topicFilters: topic,
                  })}`}
                >
                  {topics.find((t) => t.id === topic)?.name}
                </Button>
              ))}
            </Flex>
            <Flex gap={"24px"}></Flex>
          </Box>
        </Box>
        {!isTablet && (
          <Box
            gap={{ lg: 1, xl: 5, "2xl": 10 }}
            gridArea={GridAreas.LATEST_ANNOUNCEMENT}
            display="flex"
            flexDirection="row"
          >
            <SocialShare params={{ slug, locale }} />
            <LatestAnnouncement list={latestAnnouncements} />
          </Box>
        )}
        {isTablet && (
          <LatestAnnouncement
            list={latestAnnouncements}
            gridArea={GridAreas.LATEST_ANNOUNCEMENT}
          />
        )}
      </Grid>
      <Divider mb={"96px"} mt={"80px"} />
      <Heading color="heading-navy-fg" marginBottom="48px" variant="h4">
        May also interest you
      </Heading>

      <InstantSearch
        searchClient={searchClient}
        indexName={`web_posts_${env?.ALGOLIA_INDEX}`}
      >
        <Configure
          hitsPerPage={5}
          facetsRefinements={{
            topic: post.topic[0] ? [post.topic[0]] : [],
            locale: [locale],
          }}
        />
        <RelatedSection post={post} topics={topics} />
      </InstantSearch>
    </Container>
  );
}

/**
 * `RelatedSection` component.
 */

function RelatedSection({ post, topics }: Pick<Props, "post" | "topics">) {
  const { hits } = useHits<BlogHit>();
  const normalizedHits = hits.filter((hit) => hit.id !== post.id).slice(0, 4);

  return (
    <Grid
      gridGap={"24px"}
      gridTemplateColumns={"repeat(4, 1fr)"}
      marginBottom={"96px"}
      maxWidth={"100%"}
      overflowX={"auto"}
    >
      {normalizedHits.map((hit, index) => (
        <BlogCard key={index} post={hit} topics={topics as Topic[]} />
      ))}
    </Grid>
  );
}
