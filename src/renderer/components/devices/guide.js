import React from "react";
import { Select } from "antd";
const Option = Select.Option;

export default ({ packages, handleChange }) => (
  <Select
    showSearch
    style={{ width: 200 }}
    placeholder="选择一个应用"
    optionFilterProp="children"
    onChange={value => {
      handleChange(value.split("%"));
    }}
    filterOption={(input, option) =>
      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    }
  >
    {packages.map(app => (
      <Option
        key={app.packageName}
        value={app.packageName + "%" + app.activityName + "%" + app.name}
      >
        {app.name}
      </Option>
    ))}
  </Select>
);
