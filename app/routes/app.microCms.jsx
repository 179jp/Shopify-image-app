import { useLoaderData } from "react-router-dom";

import {
  Box,
  Card,
  Layout,
  Link,
  List,
  Page,
  Text,
  BlockStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

import { microcmsClient } from "../microcms.server";

export const loader = async ({ request }) => {
  const data = await microcmsClient.get({ endpoint: "patterns" });
  return data;
};

export default function PattrnsPage() {
  const patterns = useLoaderData();

  const patternList = patterns.contents.map((pattern) => (
    <li key={pattern.id}>
      <Text>
        {pattern.name}（{pattern.kana}）
      </Text>
    </li>
  ));

  return (
    <Page>
      <TitleBar title="色柄設定" />
      <Layout>
        <Layout.Section>
          <Card>
            <ul>{patternList}</ul>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                Resources
              </Text>
              <List>
                <List.Item>
                  <Link
                    url="https://shopify.dev/docs/apps/design-guidelines/navigation#app-nav"
                    target="_blank"
                    removeUnderline
                  >
                    App nav best practices
                  </Link>
                </List.Item>
              </List>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function Code({ children }) {
  return (
    <Box
      as="span"
      padding="025"
      paddingInlineStart="100"
      paddingInlineEnd="100"
      background="bg-surface-active"
      borderWidth="025"
      borderColor="border"
      borderRadius="100"
    >
      <code>{children}</code>
    </Box>
  );
}
