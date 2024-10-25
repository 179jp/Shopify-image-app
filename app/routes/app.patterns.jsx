import { useState, useEffect, useCallback } from "react";
import {
  Form,
  useFetcher,
  useLoaderData,
  useActionData,
} from "@remix-run/react";
import {
  Box,
  Button,
  Card,
  Layout,
  Link,
  List,
  Page,
  Text,
  BlockStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

import { createPattern, readPatterns } from "../models/Patterns.server";
import { Patterns } from "../assets/patterns";

export const loader = async ({ request }) => {
  return {
    patterns: Patterns,
    addPatterns: [],
    firstNum: 0,
  };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const method = request.method;
  console.log("method", method);

  if (method === "POST") {
    let postData = await request.formData();
    const mode = postData.get("mode");
    console.log("mode", mode);
    if (mode === "patternSet") {
    }
  } else {
    return Patterns;
  }
};

export default function PattrnsPage() {
  const fetcher = useFetcher();
  const { patterns, addPatterns, firstNum } = fetcher.data ?? useLoaderData();

  const [isPatternAdd, setIsPatternAdd] = useState(false);
  const [addPatternNum, setAddPatternNum] = useState(0);

  const patternList = Patterns.map((pattern) => (
    <li key={pattern.id}>
      <Text>
        {pattern.name}（{pattern.kana}）
      </Text>
    </li>
  ));

  return (
    <Page>
      <TitleBar title="色柄 初期設定" />
      <Layout>
        <Layout.Section>
          <Card>
            {isPatternAdd && (
              <div>
                <Text>{addPatternNum}件の柄を追加しました。</Text>
                <fetcher.Form method="post">
                  <input type="hidden" name="mode" value="patternSet" />
                  <input type="number" name="num" value={addPatternNum} />
                  <Button variant="primary" submit>
                    追加
                  </Button>
                </fetcher.Form>
              </div>
            )}
            <p>以下の柄をインポートします。</p>
            <Button
              variant="primary"
              onClick={() => {
                console.log("handlePatternAdd");
                handlePatternAdd();
              }}
            >
              実行する
            </Button>
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
