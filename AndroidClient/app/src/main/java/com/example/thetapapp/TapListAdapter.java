package com.example.thetapapp;

import android.content.Context;
import android.view.ViewGroup;
import android.view.View;
import androidx.recyclerview.widget.RecyclerView;

import org.json.JSONArray;
import org.json.JSONObject;

public class TapListAdapter extends RecyclerView.Adapter<TapListAdapter.ViewHolder> {

    private JSONArray m_data;
    private Context m_context;

    public TapListAdapter(JSONArray data, Context context) {
        m_data = data;
        m_context = context;
    }

    @Override
    public ViewHolder  onCreateViewHolder(ViewGroup parent, int viewType) {
        TapItemButton tapItemButton = new TapItemButton(m_context);
        return new ViewHolder(tapItemButton);
    }

    @Override
    public void onBindViewHolder(ViewHolder holder, int position) {
        try {
            JSONObject tap = m_data.getJSONObject(position);
            holder.tapButton.ConstructButton(
                    tap.optString("title"),
                    tap.optString("description"),
                    tap.optString("image_url"),
                    tap.optString("id")
            );


        } catch (Exception e) {

        }
    }


    @Override
    public int getItemCount() {
        return m_data.length();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TapItemButton tapButton;

        ViewHolder(View itemView) {
            super(itemView);
            tapButton = (TapItemButton) itemView;
        }
    }



}
