import Layout from "../../layouts/commonLayout/Layout";
import QuestionWorkflowForm from "./QuestionWorkflowForm";

export default function QuestionsForm({ mode, role = "admin" }) {
  return (
    <Layout
      role={role}
      title={mode === "edit" ? "Edit Question" : "Add Question"}
    >
      <QuestionWorkflowForm mode={mode} role={role} />
    </Layout>
  );
}
