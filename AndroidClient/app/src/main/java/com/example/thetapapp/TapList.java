package com.example.thetapapp;
import org.json.JSONArray;
import org.json.JSONObject;

import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import android.content.Context;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.widget.LinearLayout;
import android.widget.TextView;


public class TapList extends LinearLayout {

    private JSONArray m_data;
    private RecyclerView m_listView;
    private TapListAdapter m_adapter;
    private TextView m_warningText;

    public TapList(Context context) {
        super(context);
        init(context);
    }

    public TapList(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public TapList(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }


    private void init(Context context) {
        LayoutInflater.from(context).inflate(R.layout.activity_tap_list, this, true);
        m_listView = findViewById(R.id.tapListRecyclerView);
        m_listView.setLayoutManager(new LinearLayoutManager(context));
        m_warningText = findViewById(R.id.warningText);

    }

    public void setWarningText(int visible, String warningText) {
        m_warningText.setVisibility(visible);
        m_warningText.setText(warningText);
    }

    public void setData(JSONObject resp) {
        try {
            m_data = resp.getJSONArray("data");
            m_adapter = new TapListAdapter(m_data, getContext());
            m_listView.setAdapter(m_adapter);
        } catch (Exception e) {
        }
    }
}
